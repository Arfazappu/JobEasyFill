
document.addEventListener('DOMContentLoaded', loadSavedData);

let isEditing = null;// this is to basically manage editing the data

const form = document.querySelector('.form');

form.addEventListener('submit', function(event){
    event.preventDefault();

    let shortcutVal = document.getElementById('shortcut').value.trim();
    let specialChar = /[~`!@#$%^&*()_+\-={}\[\]|\\:;"'<>,.?/]/
    if(!specialChar.test(shortcutVal)){
        shortcutVal = '/'+shortcutVal;  
    }

    const descVal = document.getElementById('desc').value.trim();
    const contentVal = document.getElementById('content').value.trim();

    // console.log(shortcutVal, descVal, contentVal);

    if(isEditing){

        chrome.storage.local.get(['userData'])
        .then((res) => {
            let userData = res.userData || [];

            userData = userData.map(item =>{
                if(item.id === isEditing){
                    return {id: item.id, shortcutVal, descVal, contentVal};
                }
                return item;
            })
            // console.log(userData);
            
            return chrome.storage.local.set({userData})
        })
        .then(()=>{
            // console.log('value set');
    
            form.reset();
            isEditing = null;
            loadSavedData();
            showToast('Update shortcut successfull', 'success');

            document.getElementById('submit-btn').textContent = 'Add Command';
        })
        .catch(err =>{
            console.error(err);
            showToast('Error Updating, Please try again.',"error")
        })
        

    } else {
        chrome.storage.local.get(['userData'])
        .then((res) => {
            let userData = res.userData || [];
            userData.unshift({id:Date.now(), shortcutVal, descVal, contentVal});
            // console.log(userData);
    
            return chrome.storage.local.set({userData})
        })
        .then(()=>{
            // console.log('value set');
            showToast('Add new shortcut successfull ', 'success');
            
            form.reset();
            loadSavedData();
        })
        .catch(err =>{
            console.error(err);
            showToast('Error Adding, Please try again.',"error")

        })
    }
    
   
})

function loadSavedData(){

    let userDataList = document.getElementById('data-list-cont');
    userDataList.innerHTML = '';

    chrome.storage.local.get(['userData'])
    .then((res) => {
        let userData = res?.userData;

        if(userData.length > 0){
            userData.forEach(item => {
                let list = document.createElement('li');
                list.classList.add('data-list');
                list.dataset.id = item?.id;
    
                list.innerHTML = `
                <div class="command">
                <p>${item?.shortcutVal}</p>
                <div class="action-btn">
                  <button class="edit" title="Edit">Edit</button>
                  <button class="delete" title="Delete">Delete</button>
                </div>
              </div>
              <div class="data">
                <div class="data-desc">${item?.descVal}</div>
                <div class="data-content-container">
                  <div class="data-content">
                   ${item?.contentVal}
                  </div>
                  <button type="button" class="toggle-btn">show more</button>
                </div>
              </div>
                `
    
                userDataList.appendChild(list);
                
                
        })
    
        checkForOverflow();
        } else{
            userDataList.innerHTML = '<p style="text-align: center;">No saved shortcuts</p>'
        }
        
    })
    .catch(err => {
        console.error(err);
        showToast('Error Loading, Please try again.',"error")

    })
}


function checkForOverflow(){
    let dataContentCont = document.querySelectorAll('.data-content-container');
    // console.log(dataContentCont);

    dataContentCont.forEach(container => {
        let content = container.querySelector('.data-content');
        let toggleBtn = container.querySelector('.toggle-btn');

        // console.log(content, toggleBtn);
        

        let contentWholeHeight = content.scrollHeight;
        let contentVisibleHeight = content.offsetHeight;
        // console.log(contentWholeHeight,contentVisibleHeight );

        if(contentWholeHeight > contentVisibleHeight){
            toggleBtn.classList.add('show-btn');
        }
        
    })
    
}

document.addEventListener('click', function(event){
    // console.log(event.target);
    if(event.target.classList.contains('toggle-btn')){
        let content = event.target.previousElementSibling;

        content.classList.toggle('expanded');
    
        if(content.classList.contains('expanded')){
            event.target.textContent = 'show less';
        } else {
            event.target.textContent = 'show more';
        }
    }

    if(event.target.classList.contains('delete')){
        let dataList = event.target.closest('.data-list');
        let dataListId = parseInt(dataList.dataset.id);
        // console.log(dataListId);
        
        deleteItem(dataListId);
    }

    if(event.target.classList.contains('edit')){
        let dataList = event.target.closest('.data-list');
        let dataListId = parseInt(dataList.dataset.id);

        isEditing = dataListId;
        editItem(dataListId);
    }
    
})

function deleteItem(dataListId){
    chrome.storage.local.get(['userData'])
    .then((res) => {
        let userData = res.userData || [];
        // console.log(typeof(dataListId))
        // console.log(userData);
        
        let updatedData = userData.filter(item => item.id !== dataListId);

        userData = updatedData;
        
        return chrome.storage.local.set({userData});
    })
    .then(()=>{
        // console.log('delete success');
        showToast('Delete shortcut successfull',"success");
        loadSavedData();
    })
    .catch(err => {
        console.error(err);
        showToast('Error Deleting, Please try again.',"error");
        
    })
}

function editItem(dataListId){
    // console.log(dataListId);

    chrome.storage.local.get(['userData'])
    .then((res) =>{
        let userData = res.userData || [];
        
        return toEditData = userData.find(item => item.id === dataListId);

    })
    .then((dataToEdit) => {
        // console.log(dataToEdit);

        document.getElementById('shortcut').value = dataToEdit.shortcutVal;
        document.getElementById('desc').value = dataToEdit.descVal;
        document.getElementById('content').value = dataToEdit.contentVal;

        document.getElementById('submit-btn').textContent = 'Save Command';


        
    })
    .catch(err => {
        console.error(err);
        
    }) 
    
}

function showToast(message, type) {
    const toastDiv = document.createElement('div');
    toastDiv.className = `toast ${type} show`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);

    setTimeout(() => {
        toastDiv.classList.remove('show');
        toastDiv.addEventListener('transitionend', () => {
            toastDiv.remove();
        });
    }, 3000); // Duration for the toast to stay visible
}
