export class Editor {
    constructor(State) {
        this.State = State;
        this.editor_node = null;
    }
    
    create = (element_id, callback) => { 
        this.editor_node = $(element_id);

        this.editor_node.summernote({
            placeholder: 'Here you can write your article. Good luck!',
            tabsize: 2,
            height: 400,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                // ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']],
            ],
            callbacks: {
                onImageUpload: function(image) {
                    this.uploadImage(image[0]);
                }
            }
        });
        return this.editor_node;
    }
    
    uploadImage = (image) => {
        var data = new FormData();
        data.append("image", image);
        let name = this.editor_node
        $.ajax({
            url: 'Your url to deal with your image',
            cache: false,
            contentType: false,
            processData: false,
            data: data,
            type: "post",
            success: function(url) {
                var image = $('<img>').attr('src', 'http://' + url);
                $('#summernote').summernote("insertNode", image[0]);
            },
            error: function(data) {
                console.log(data);
            }
        });
    }
}
