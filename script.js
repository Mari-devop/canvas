const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const uploadBtn = document.getElementById('upload-btn');

let isDragging = false;
let startX, startY;
let draggedImage = null;
const images = [];

uploadBtn.addEventListener('change', (e) => {
  const files = e.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const imgObj = {
          image: img,
          x: 50,
          y: 50,
          width: img.width,
          height: img.height
        };
        images.push(imgObj);
        draw();
      };
    };
    reader.readAsDataURL(file);
  }
});

canvas.addEventListener('mousedown', (e) => {
  const mousePos = getMousePos(canvas, e);
  draggedImage = getImageAtPosition(mousePos);
  if (draggedImage) {
    isDragging = true;
    startX = mousePos.x - draggedImage.x;
    startY = mousePos.y - draggedImage.y;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging && draggedImage) {
    const mousePos = getMousePos(canvas, e);
    draggedImage.x = mousePos.x - startX;
    draggedImage.y = mousePos.y - startY;
    draw();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  draggedImage = null;
});

canvas.addEventListener('mouseout', () => {
  isDragging = false;
  draggedImage = null;
});

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function getImageAtPosition(pos) {
  for (let i = images.length - 1; i >= 0; i--) {
    const img = images[i];
    if (pos.x > img.x && pos.x < img.x + img.width &&
        pos.y > img.y && pos.y < img.y + img.height) {
      return img;
    }
  }
  return null;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  images.forEach(img => {
    ctx.drawImage(img.image, img.x, img.y);
  });
}
