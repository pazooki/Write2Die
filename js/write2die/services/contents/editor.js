export class Editor {
    constructor(State) {
        this.State = State;
        this.editor_node = null;
    }
    
    create = (element_id) => { 
        this.editor_node = $(element_id);

        this.editor_node.summernote({
            placeholder: 'Here you can write your article. Good luck!',
            tabsize: 2,
            height: 400,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']],
              ],
        });
        return this.editor_node;
    }
}
