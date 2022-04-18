export class Fonts {
    constructor(State) {
        this.State = State;
    }

    setupFonts = () => {
        
        let ACaslonProItalic = new FontFace('ACaslonPro-Italic', 'url(http://localhost/static/fonts/ACaslonPro-Italic.otf)');
        let ny = new FontFace('NY Irvin', 'url(http://localhost/static/fonts/NY Irvin.ttf)');
        ACaslonProItalic.load();
        ny.load();
        document.fonts.add(ACaslonProItalic);
        document.fonts.add(ny);
    }
}