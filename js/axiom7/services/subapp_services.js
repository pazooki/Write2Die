import { Chat } from './messaging/chat.js';
import { Notification } from './messaging/notification.js';
import { Articles } from './contents/articles.js';
import { Editor } from './contents/editor.js';

let SubAppServices = {
    Chat: Chat,
    Notification: Notification,
    Articles: Articles,
    Editor: Editor
}

export {
    SubAppServices
}