    // Initialize elements
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const baseImage = document.getElementById('base-image');
const generateButton = document.getElementById('generate-button');
const promptInput = document.getElementById('prompt-input');
const statusDisplay = document.getElementById('status-display');
const maskPreview = document.getElementById('mask-preview');
const maskDisplayArea = document.getElementById('mask-display-area');

// Drawing state
let isDrawing = false;

const undoButton = document.getElementById('undo-button');
let undoStack = []; // This array will hold our canvas snapshots

// 1. Initialize Canvas size to match the displayed image
function initCanvas() {
    // Wait for image to load to get correct display dimensions
    if (baseImage.complete) {
        canvas.width = baseImage.clientWidth;
        canvas.height = baseImage.clientHeight;
        resetCanvas(); // Clear initially to ensure a clean mask
    } else {
        baseImage.addEventListener('load', initCanvas);
    }
}

// 2. Reset the canvas with a solid white background (white=edit area)
// Update your existing resetCanvas function:
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = []; // <--- NEW: Clear the undo history
}

// Save the canvas state BEFORE a new stroke begins
function saveState() {
    // getImageData grabs the exact pixel data of the canvas
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Optional: Keep memory usage in check by limiting history to the last 20 strokes
    if (undoStack.length > 20) {
        undoStack.shift(); 
    }
}

// Restore the previous canvas state
function undo() {
    if (undoStack.length > 0) {
        // Pop the last saved state and put it back onto the canvas
        const previousState = undoStack.pop();
        ctx.putImageData(previousState, 0, 0);
    } else {
        // If the stack is empty, just make sure the canvas is completely clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 3. Drawing Logic
// -----------------------------------------------------------------

// Start drawing
canvas.addEventListener('mousedown', (e) => {
    saveState(); // <--- NEW: Save the state before drawing
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Draw a simple thick line
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    // Set drawing style (Black line on white background)
    // In Nano Banana 2 (Gemini 3 Flash), White = MASK, Black = PRESERVE.
    // So we draw BLACK on WHITE to define the object's area.
    
    // Set drawing style
    ctx.strokeStyle = 'white'; // CHANGED: Draw in white instead of black
    ctx.lineWidth = 30; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

// Stop drawing
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// 4. Convert Canvas to Base64 Mask
// -----------------------------------------------------------------
// Replace your existing generateMaskBase64 function with this:
function generateMaskBase64() {
    // 1. Create a temporary, invisible canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // 2. Fill the background with solid black (The "Preserve" area for the API)
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 3. Stamp the user's transparent canvas (with their white strokes) on top
    tempCtx.drawImage(canvas, 0, 0);

    // 4. Export this combined black-and-white mask
    return tempCanvas.toDataURL('image/jpeg', 0.8); 
}

// 5. Simulate API Call
// -----------------------------------------------------------------
// 5. Send Data to Python Backend
// -----------------------------------------------------------------
generateButton.addEventListener('click', async () => {
    const prompt = promptInput.value;
    if (!prompt) {
        statusDisplay.textContent = "Please enter a description first.";
        return;
    }

    const maskBase64 = generateMaskBase64();
    
    // We also need to get the Base64 of the base image to send to the backend.
    // Assuming the user uploaded an image, it's currently stored in baseImage.src
    const imageBase64 = baseImage.src; 
    
    maskPreview.src = maskBase64;
    maskDisplayArea.classList.remove('hidden');
    
    statusDisplay.textContent = `Sending to backend...`;
    generateButton.disabled = true;

    try {
        // Send the POST request to your Flask server
        const response = await fetch('http://localhost:5000/api/carve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                maskBase64: maskBase64,
                imageBase64: imageBase64
            })
        });

        const data = await response.json();

        if (response.ok) {
            statusDisplay.textContent = "Success! Image carved.";
            // Update the UI with the image returned from the backend
            baseImage.src = data.generated_image_url;
            // Re-initialize the canvas over the new generated image
            baseImage.onload = () => { initCanvas(); };
        } else {
            statusDisplay.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        console.error("Network error:", error);
        statusDisplay.textContent = "Error connecting to backend.";
    } finally {
        generateButton.disabled = false;
    }
});

// 6. Handle Image Uploads
// -----------------------------------------------------------------
const imageUpload = document.getElementById('image-upload');

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    // If the user cancels the file dialog, do nothing
    if (!file) return;

    statusDisplay.textContent = "Loading your room...";

    // Use FileReader to read the image file on the client side
    const reader = new FileReader();
    
    reader.onload = (event) => {
        // event.target.result contains the Base64 Data URL of the uploaded image
        baseImage.src = event.target.result;
        
        // When the new image finishes loading into the DOM, reset the canvas
        // to perfectly match the new image's dimensions.
        baseImage.onload = () => {
            initCanvas();
            statusDisplay.textContent = "New room loaded! Draw your mask.";
        };
    };

    // Trigger the file read operation
    reader.readAsDataURL(file);
});

// Listen for button click
undoButton.addEventListener('click', undo);

// Listen for keyboard shortcut (Ctrl+Z or Cmd+Z)
document.addEventListener('keydown', (e) => {
    // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed along with 'z'
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault(); // Prevent default browser undo behavior
        undo();
    }
});

// Start the app
initCanvas();