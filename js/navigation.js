import { runRoomAnalysis } from './gemini.js';

const furnitureBrowser = document.getElementById('furnitureBrowser');
const inspirationArea = document.getElementById('inspirationArea');
const customizeArea = document.getElementById('customizeArea');
const roomPanel = document.getElementById('roomPanel');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');

export function setupNavigation() {
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            sidebarBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tooltip = btn.dataset.tooltip;

            if (tooltip === 'Room') {
                roomPanel.classList.add('open');
                furnitureBrowser.classList.remove('open');
                inspirationArea.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Add') {
                furnitureBrowser.classList.add('open');
                roomPanel.classList.remove('open');
                inspirationArea.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Inspiration') {
                inspirationArea.classList.add('open');
                roomPanel.classList.remove('open');
                furnitureBrowser.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Customize with Gemini') {
                customizeArea.classList.add('open');
                roomPanel.classList.remove('open');
                furnitureBrowser.classList.remove('open');
                inspirationArea.classList.remove('open');
                runRoomAnalysis();
            } else {
                // For 'Select' or others, close everything
                roomPanel.classList.remove('open');
                furnitureBrowser.classList.remove('open');
                inspirationArea.classList.remove('open');
                customizeArea.classList.remove('open');
            }
        });
    });
}
