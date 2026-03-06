let localData = [];

// Initialize data
function init() {
    // Check local storage first
    const savedData = localStorage.getItem('simple_portfolio_data');
    if (savedData) {
        try {
            localData = JSON.parse(savedData);
        } catch (e) {
            console.error("Parse error", e);
            localData = JSON.parse(JSON.stringify(PORTFOLIO_DATA)); // deep copy default
        }
    } else {
        localData = JSON.parse(JSON.stringify(PORTFOLIO_DATA)); // deep copy default
    }
    renderList();
}

function renderList() {
    const list = document.getElementById('portfolio-list');
    list.innerHTML = '';

    localData.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'admin-item';
        itemEl.draggable = true;

        // Drag and Drop Event Listeners
        itemEl.addEventListener('dragstart', (e) => dragStart(e, index));
        itemEl.addEventListener('dragover', dragOver);
        itemEl.addEventListener('drop', (e) => drop(e, index));
        itemEl.addEventListener('dragenter', dragEnter);
        itemEl.addEventListener('dragleave', dragLeave);
        itemEl.addEventListener('dragend', dragEnd);

        const posterSrc = item.posterSrc || item.previewSrc || '';

        itemEl.innerHTML = `
            <div class="admin-controls">
                <button class="icon-btn" onclick="moveUp(${index})" ${index === 0 ? 'disabled style="opacity:0.3"' : ''} title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                <div style="text-align:center; font-weight:bold; color:var(--text-secondary)">${index + 1}</div>
                <button class="icon-btn" onclick="moveDown(${index})" ${index === localData.length - 1 ? 'disabled style="opacity:0.3"' : ''} title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
            </div>
            
            <div>
                <img src="${posterSrc}" alt="Thumbnail" class="thumbnail-preview" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAxNiA5Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUiIHk9IjUiIGZpbGw9IiM1NTUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
            </div>

            <div class="item-fields">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="field-group">
                        <label>Title</label>
                        <input type="text" value="${item.title || ''}" onchange="updateField(${index}, 'title', this.value)">
                    </div>
                    <div class="field-group">
                        <label>Subtitle / Role</label>
                        <input type="text" value="${item.subtitle || item.role || ''}" onchange="updateField(${index}, 'subtitle', this.value)">
                    </div>
                </div>
                
                <div class="field-group">
                    <label>Description</label>
                    <input type="text" value="${item.desc || ''}" onchange="updateField(${index}, 'desc', this.value)">
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="field-group">
                        <label>Thumbnail Image (.jpg)</label>
                        <div style="display:flex; gap:5px;">
                            <input type="text" style="flex:1;" id="thumb-input-${index}" value="${item.posterSrc || ''}" onchange="updatePosterField(${index}, this.value)">
                            <button class="btn btn-secondary" style="padding: 10px;" onclick="triggerFileSelect(${index}, 'thumb')" title="Browse"><i class="fa-solid fa-folder-open"></i></button>
                            <input type="file" id="thumb-file-${index}" style="display:none;" accept="image/jpeg, image/png, image/webp" onchange="handleFileSelect(event, ${index}, 'thumb')">
                        </div>
                    </div>
                    <div class="field-group">
                        <label>Video File (.webm)</label>
                        <div style="display:flex; gap:5px;">
                            <input type="text" style="flex:1;" id="video-input-${index}" value="${item.previewSrc || ''}" onchange="updateVideoField(${index}, this.value)">
                            <button class="btn btn-secondary" style="padding: 10px;" onclick="triggerFileSelect(${index}, 'video')" title="Browse"><i class="fa-solid fa-folder-open"></i></button>
                            <input type="file" id="video-file-${index}" style="display:none;" accept="video/webm, video/mp4" onchange="handleFileSelect(event, ${index}, 'video')">
                        </div>
                    </div>
                </div>
            </div>

            <div class="admin-controls">
                <button class="icon-btn danger-btn" onclick="deleteItem(${index})" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        list.appendChild(itemEl);
    });
}

function updateField(index, field, value) {
    localData[index][field] = value;
}

function updatePosterField(index, value) {
    localData[index].posterSrc = value;
    renderList();
}

function updateVideoField(index, value) {
    localData[index].previewSrc = value;
    // Keep media inline with the video (use single quotes to avoid breaking HTML template literal above)
    localData[index].media = '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="' + value + '" type="video/webm"></video>';
    renderList();
}

function triggerFileSelect(index, type) {
    document.getElementById(`${type}-file-${index}`).click();
}

function handleFileSelect(event, index, type) {
    const file = event.target.files[0];
    if (file) {
        // Since browsers don't give the full local path for security, 
        // we assume the user places them in the 'assets' folder and just extract the filename.
        const fileName = file.name;
        const mappedPath = 'assets/' + fileName;

        if (type === 'thumb') {
            updatePosterField(index, mappedPath);
        } else if (type === 'video') {
            updateVideoField(index, mappedPath);
        }
    }
}

function moveUp(index) {
    if (index > 0) {
        const temp = localData[index];
        localData[index] = localData[index - 1];
        localData[index - 1] = temp;
        renderList();
    }
}

function moveDown(index) {
    if (index < localData.length - 1) {
        const temp = localData[index];
        localData[index] = localData[index + 1];
        localData[index + 1] = temp;
        renderList();
    }
}

function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        localData.splice(index, 1);
        renderList();
    }
}

// --- Drag and Drop Reordering Logic ---
let dragStartIndex = -1;

function dragStart(e, index) {
    dragStartIndex = index;
    // Delay adding the dragging class so the dragged ghost image looks normal
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
}

function dragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
}

function dragEnter(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('admin-item')) {
        e.currentTarget.classList.add('drag-over');
    }
}

function dragLeave(e) {
    if (e.currentTarget.classList.contains('admin-item')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
    const items = document.querySelectorAll('.admin-item');
    items.forEach(item => item.classList.remove('drag-over'));
}

function drop(e, dropIndex) {
    e.preventDefault();
    const targetEl = e.currentTarget;
    if (targetEl.classList.contains('admin-item')) {
        targetEl.classList.remove('drag-over');
    }

    if (dragStartIndex !== -1 && dragStartIndex !== dropIndex) {
        // Move item in array
        const itemToMove = localData.splice(dragStartIndex, 1)[0];
        localData.splice(dropIndex, 0, itemToMove);
        renderList();
    }
    dragStartIndex = -1;
}

function addNewItem() {
    localData.unshift({
        title: "New Project",
        subtitle: "TBD",
        role: "TBD",
        desc: "설명을 여기에 적어주세요.",
        previewType: "video",
        posterSrc: "assets/new_thumbnail.jpg",
        previewSrc: "assets/new_video.webm",
        media: '<video autoplay loop controls playsinline style="width:100%;height:100%;"><source src="assets/new_video.webm" type="video/webm"></video>'
    });
    renderList();
    window.scrollTo(0, 0);
}

function saveData() {
    localStorage.setItem('simple_portfolio_data', JSON.stringify(localData));
    showToast();
}

function resetToDefaults() {
    if (confirm('Are you sure you want to discard all changes and revert back to the code defaults?')) {
        localStorage.removeItem('simple_portfolio_data');
        localData = JSON.parse(JSON.stringify(PORTFOLIO_DATA));
        renderList();
        showToast();
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start
init();
