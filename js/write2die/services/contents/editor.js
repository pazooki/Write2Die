export class Editor {
    constructor(State) {
        this.State = State;
    }
    
    create = () => { 
        let container = document.getElementById('editor');
        let editor = new Quill(container, {
            theme: 'snow'
          });

        return editor;
    }

}
