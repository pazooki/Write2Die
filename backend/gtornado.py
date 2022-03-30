# This file is part of gunicorn released under the MIT license.
# See the NOTICE for more information.
# filename: gtornado.py

import copy
import os
import sys

from gunicorn.workers.base import Worker
import tornado
import tornado.httpserver
import tornado.web
from tornado.ioloop import IOLoop, PeriodicCallback

class TornadoWorker(Worker):
    def handle_exit(self, sig, frame):
        if self.alive:
            super().handle_exit(sig, frame)

    def handle_request(self):
        self.nr += 1
        if self.alive and self.nr >= self.max_requests:
            self.log.info("Autorestarting worker after current request.")
            self.alive = False

    def watchdog(self):
        if self.alive:
            self.notify()

        if self.ppid != os.getppid():
            self.log.info("Parent changed, shutting down: %s", self)
            self.alive = False

    def heartbeat(self):
        if not self.alive:
            if self.server_alive:
                if hasattr(self, 'server'):
                    try:
                        self.server.stop()
                    except Exception:  # pylint: disable=broad-except
                        pass
                self.server_alive = False
            else:
                for callback in self.callbacks:
                    callback.stop()
                self.ioloop.stop()

    def init_process(self):
        # IOLoop cannot survive a fork or be shared across processes
        # in any way. When multiple processes are being used, each process
        # should create its own IOLoop. We should clear current IOLoop
        # if exists before os.fork.
        IOLoop.clear_current()
        super().init_process()

    def run(self):
        self.ioloop = IOLoop.current()
        self.alive = True
        self.server_alive = False

        self.callbacks = []
        self.callbacks.append(PeriodicCallback(self.watchdog, 1000))
        self.callbacks.append(PeriodicCallback(self.heartbeat, 1000))
        for callback in self.callbacks:
            callback.start()

        # Assume the app is a WSGI callable if its not an
        # instance of tornado.web.Application or is an
        # instance of tornado.wsgi.WSGIApplication
        app = self.wsgi

        # Monkey-patching HTTPConnection.finish to count the
        # number of requests being handled by Tornado. This
        # will help gunicorn shutdown the worker if max_requests
        # is exceeded.
        httpserver = sys.modules["tornado.httpserver"]
        if hasattr(httpserver, 'HTTPConnection'):
            old_connection_finish = httpserver.HTTPConnection.finish

            def finish(other):
                self.handle_request()
                old_connection_finish(other)

            httpserver.HTTPConnection.finish = finish
            sys.modules["tornado.httpserver"] = httpserver

            server_class = tornado.httpserver.HTTPServer
        else:
            class TornadoHTTPServer(httpserver.HTTPServer):
                def __init__(self, request_callback, xheaders=True, **kwargs):
                    super(TornadoHTTPServer, self).__init__(request_callback, xheaders=xheaders, **kwargs)

                def on_close(instance, server_conn):  # pylint: disable=no-self-argument
                    self.handle_request()
                    super(TornadoHTTPServer, instance).on_close(server_conn)


            server_class = TornadoHTTPServer

        app_params = {
            "max_buffer_size": 200 * 1024 * 1024,  # 200MB
            "decompress_request": True,
        }
        if self.cfg.is_ssl:
            _ssl_opt = copy.deepcopy(self.cfg.ssl_options)
            # tornado refuses initialization if ssl_options contains following
            # options
            del _ssl_opt["do_handshake_on_connect"]
            del _ssl_opt["suppress_ragged_eofs"]
            app_params["ssl_options"] = _ssl_opt
        server = server_class(app, **app_params)

        self.server = server
        self.server_alive = True

        for socket in self.sockets:
            socket.setblocking(0)
            server.add_socket(socket)

        server.no_keep_alive = self.cfg.keepalive <= 0
        server.start(num_processes=1)

        self.ioloop.start()
