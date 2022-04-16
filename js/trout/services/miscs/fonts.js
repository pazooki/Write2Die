export class Fonts {
    constructor(State) {
        this.State = State;
    }

    setupFonts = () => {
        let ny = new FontFace('Pacifico', 'url(https://fonts.gstatic.com/s/pacifico/v21/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)');
        ny.load();
        document.fonts.add(ny);
    }
}