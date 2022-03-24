
class GovDocuments {

    govIdSave(files){
        for (var idx = 0; idx < files.length; idx++){
            postBase64File(files[idx]);
        }
        notify('Successfully Uploaded ' + files.length + ' file(s)');
    }
    
    
    async getGovId(){
        notify('Loading your documents.');
        var xhr = new XMLHttpRequest();
        xhr.open("POST", govid_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', getCookie('uuid'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.response);
                var archivedFilesDiv = document.getElementById('file-archive');
                archivedFilesDiv.innerHTML = '';
                var itemIdx = 0;
    
                for(itemIdx = 0; itemIdx < data.files.length; itemIdx++){
                    var fileObj = data.files[itemIdx];
                    var key = fileObj.ts; 
                    var row = document.createElement('div');
                    row.setAttribute('class', 'row');
                    row.setAttribute('id', key + '-row-' + itemIdx);
    
                    var fileItemColName = document.createElement('div');
                    fileItemColName.setAttribute('class', 'col-sm-4');
                    fileItemColName.setAttribute('id', key + '-col-' + itemIdx);
    
                    var fileLink = document.createElement('a');
                    fileLink.setAttribute('download', fileObj.name);
                    fileLink.href = fileObj.file.memtype + 'base64,' + fileObj.file.data;
                    fileLink.innerText = fileObj.name;
    
                    var iconSpan = document.createElement('span');
                    iconSpan.setAttribute('class', 'feather-sm me-1');
                    iconSpan.setAttribute('id', key + '-icon-' + itemIdx);
    
                    var fileItemColIcon = document.createElement('div');
                    fileItemColIcon.setAttribute('class', 'col-sm-1');
                    fileItemColIcon.setAttribute('id', key + '-col-icon-' + itemIdx);
    
                    var iconAttr;
                    if (fileObj.status === 'Approved'){
                        iconAttr = feather.icons['check'];
                        fileItemColIcon.setAttribute('style', 'color: green');
                    } else if (fileObj.status === 'Under Review') {
                        iconAttr = feather.icons['clock'];
                        fileItemColIcon.setAttribute('style', 'color: orange');
                    } else if (fileObj.status === 'Rejected') {
                        iconAttr = feather.icons['x'];
                        fileItemColIcon.setAttribute('style', 'color: red');
                    }
                    
                    iconAttr.attrs.id = key + '-icon-feather-' + itemIdx;
                    iconSpan.innerHTML = iconAttr.toSvg();
    
                    var timestampCol = document.createElement('div');
                    timestampCol.setAttribute('class', 'col-sm-3');
                    timestampCol.setAttribute('id', fileObj.ts);
                    timestampCol.innerText = (new Date(fileObj.ts)).toLocaleString();
    
    
                    var fileItemColComment = document.createElement('div');
                    fileItemColComment.setAttribute('class', 'col-sm-4');
                    fileItemColComment.setAttribute('id', key + '-col-comment-' + itemIdx);
                    fileItemColComment.innerText = 'Comment: ' + fileObj.comment;
    
                    fileItemColName.appendChild(fileLink);
                    fileItemColIcon.appendChild(iconSpan);
                    row.appendChild(fileItemColName);
                    row.appendChild(timestampCol);
                    row.appendChild(fileItemColIcon);
                    // row.appendChild(fileItemColStatus);
                    row.appendChild(fileItemColComment);
                    archivedFilesDiv.appendChild(row);
                    archivedFilesDiv.appendChild(document.createElement('hr'));
                }
                var govIdHeaderStatus = document.getElementById('gov-id-status');
    
                var govIdStatusSpan = document.getElementById('gov-id-status-span');
                if (govIdStatusSpan !== null) {
                    govIdStatusSpan.remove();
                }
    
                var govIdStatusSpan = document.createElement('span');
                govIdStatusSpan.setAttribute('id', 'gov-id-status-span');
                govIdStatusSpan.innerHTML =  '&emsp;&emsp;Status: ' + data.status + '   ';
    
                if (data.status === 'Under Review'){
                    crossCheck('btn-step-gov-id', 'tab-gov-id-icon', 'clock');
                    crossCheck('side-nav-gov-id', 'side-nav-gov-id-icon', 'clock');
                    govIdStatusSpan.innerHTML += feather.icons['clock'].toSvg();
                    notify('Documents are under review.', true);
                    govIdStatusSpan.setAttribute('style', 'color: orange;');
                } else if (data.status === 'Rejected') {
                    crossCheck('btn-step-gov-id', 'tab-gov-id-icon', 'x');
                    crossCheck('side-nav-gov-id', 'side-nav-gov-id-icon', 'x');
                    govIdStatusSpan.innerHTML += feather.icons['x'].toSvg();
                    notify('Some documents were rejected.', true);
                    govIdStatusSpan.setAttribute('style', 'color: red;');
                } else if (data.status === 'Approved') {
                    crossCheck('btn-step-gov-id', 'tab-gov-id-icon', 'check');
                    crossCheck('side-nav-gov-id', 'side-nav-gov-id-icon', 'check');
                    govIdStatusSpan.innerHTML += feather.icons['check'].toSvg();
                    notify('All documents were approved.', true);
                    govIdStatusSpan.setAttribute('style', 'color: green;');
                } else if (data.status === 'Incomplete'){
                    crossCheck('btn-step-gov-id', 'tab-gov-id-icon', 'x');
                    crossCheck('side-nav-gov-id', 'side-nav-gov-id-icon', 'x');
                    govIdStatusSpan.innerHTML += feather.icons['x'].toSvg();
                    notify('No document is submitted yet.', true);
                    govIdStatusSpan.setAttribute('style', 'color: red;');
                }
                govIdHeaderStatus.appendChild(govIdStatusSpan);
    
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                notify('Uploading Files Failed', false);
            }
        }
        xhr.send(JSON.stringify({'action': 'get'}));
    }
    
    
    async postGovId(payload){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", govid_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', getCookie('uuid'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.response);
                if (data.status){
                    getGovId();
                    notify(data.msg, false);
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                notify('Uploading Files Failed', false);
            }
        }
        notify('Uploading...')
        xhr.send(JSON.stringify(payload));
    }
    
    
    async postBase64File(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        const payload = {
            'action': 'post', 
            'files': {}
        };
        reader.onload = function(){
            payload['files'][file.name] = reader.result;
            console.log(payload);
            postGovId(payload);
        }
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
    }

}

export default {
    GovDocuments
}