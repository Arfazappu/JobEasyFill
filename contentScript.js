
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args)
        }, delay)
    }
}

let lastFocusedElement = null;

document.addEventListener('focusin',(e)=>{
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        lastFocusedElement = e.target;
    }
})

document.addEventListener('input', debounce(function (event) {
    let targetEle = event.target;
    if (targetEle.tagName == 'INPUT' || targetEle.tagName == 'TEXTAREA') {
        let inputVal = targetEle.value.trim();

        if (inputVal.includes('?')) {
            showPopup(targetEle)
        } else {
            hidePopup()
        }

        chrome.storage.local.get(['userData'])
            .then((res) => {
                let userData = res.userData || [];

                userData.forEach(item => {
                    if (item.shortcutVal == inputVal) {
                        targetEle.value = targetEle.value.replace(inputVal, item.contentVal);
                    }
                });
            })
            .catch(err => {
                console.error('Error', err);

            })
    }
}, 300))

function showPopup(targetEl) {
    chrome.storage.local.get(['userData'])
        .then(res => {
            const userData = res.userData || [];

            if (userData.length === 0) return;

            let popup = document.querySelector('.data-popup');
            if (!popup) {
                popup = document.createElement('ul')
                popup.classList.add('data-popup')
                document.body.appendChild(popup);
            }

            const rect = targetEl.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 5}px`;

            popup.innerHTML = userData.map(item => `
                <li class="popup-item" data-content="${item.contentVal}">
                    ${item.descVal}
                </li>
            `).join('');

            popup.style.display = 'block';

        })


}

function hidePopup() {
    let popup = document.querySelector('.data-popup');
    if(popup){
        popup.style.display = 'none';
    }
}

document.addEventListener('click', function(event){
    if(event.target.classList.contains('popup-item')){
        // console.log(event.target.parentElement);
        
        let itemContent = event.target.dataset.content;

        if(lastFocusedElement){
            lastFocusedElement.focus();
            lastFocusedElement.value = itemContent;
        }
        
        hidePopup();
    }
    
})

document.addEventListener('click', function(event){
    let popup = document.querySelector('.data-popup');
    if(popup && !event.target.closest('.data-popup')){
        hidePopup();
    }
})