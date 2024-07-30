const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const uploadBtn = document.getElementById('upload-btn');
const dropArea = document.getElementById('drop-area');
const imageList = document.getElementById('image-list');
const textInput = document.getElementById('text-input');
const addTextButton = document.getElementById('add-text');

let isDragging = false;
let startX, startY;
let draggedItem = null;
const items = [];
const itemMap = new Map();

uploadBtn.addEventListener('change', handleFiles);
dropArea.addEventListener('dragover', (e) => e.preventDefault());
dropArea.addEventListener('drop', handleDrop);
dropArea.addEventListener('click', () => uploadBtn.click());

canvas.addEventListener('mousedown', (e) => {
  const mousePos = getMousePos(canvas, e);
  draggedItem = getItemAtPosition(mousePos);
  if (draggedItem) {
    isDragging = true;
    startX = mousePos.x - draggedItem.x;
    startY = mousePos.y - draggedItem.y;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging && draggedItem) {
    const mousePos = getMousePos(canvas, e);
    draggedItem.x = mousePos.x - startX;
    draggedItem.y = mousePos.y - startY;
    draw();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  draggedItem = null;
});

canvas.addEventListener('mouseout', () => {
  isDragging = false;
  draggedItem = null;
});

addTextButton.addEventListener('click', () => {
  const text = textInput.value;
  if (text) {
    const id = generateUniqueId();
    const textObj = {
      type: 'text',
      text: text,
      x: 50,
      y: 50,
      id: id
    };
    items.push(textObj);
    itemMap.set(id, textObj);
    draw();
  }
});

function handleFiles(e) {
  const files = e.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const id = generateUniqueId();
        const imgObj = {
          type: 'image',
          image: img,
          id: id,
          x: 0,
          y: 0,
          width: img.width > 100 ? 100 : img.width,
          height: img.height > 100 ? 100 : img.height
        };
        itemMap.set(id, imgObj);
        addImageToList(imgObj);
      };
    };
    reader.readAsDataURL(file);
  }
}

function handleDrop(e) {
  e.preventDefault();
  const files = e.dataTransfer.files;
  handleFiles({ target: { files } });
}

function addImageToList(imgObj) {
  const imgItem = document.createElement('div');
  imgItem.className = 'image-item';
  imgItem.innerHTML = `<img src="${imgObj.image.src}" class="small-image">`;
  imgItem.draggable = true;

  imgItem.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', imgObj.id);
  });

  imageList.appendChild(imgItem);
}

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function getItemAtPosition(pos) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.type === 'image') {
      if (pos.x > item.x && pos.x < item.x + item.width &&
          pos.y > item.y && pos.y < item.y + item.height) {
        return item;
      }
    } else if (item.type === 'text') {
      const textWidth = ctx.measureText(item.text).width;
      const textHeight = 16; // approximate text height
      if (pos.x > item.x && pos.x < item.x + textWidth &&
          pos.y > item.y && pos.y < item.y + textHeight) {
        return item;
      }
    }
  }
  return null;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  items.forEach(item => {
    if (item.type === 'image') {
      ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    } else if (item.type === 'text') {
      ctx.fillText(item.text, item.x, item.y);
    }
  });
}

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const itemObj = itemMap.get(id);
  if (itemObj) {
    itemObj.x = e.offsetX;
    itemObj.y = e.offsetY;
    items.push(itemObj);
    draw();
    itemMap.delete(id); 
  }
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substring(2, 9);
}