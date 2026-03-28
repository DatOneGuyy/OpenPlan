const dialogModal = document.getElementById('dialogModal');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
const dialogCancelBtn = document.getElementById('dialogCancelBtn');

/**
 * Shows a custom confirmation dialog.
 * @param {string} message - The message to display.
 * @param {string} title - The title of the dialog.
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
 */
export function showConfirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'block';
        dialogConfirmBtn.textContent = 'Confirm';
        
        dialogModal.style.display = 'flex';

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            dialogCancelBtn.removeEventListener('click', onCancel);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        dialogCancelBtn.addEventListener('click', onCancel);
        window.addEventListener('keydown', onKeyDown);
    });
}

/**
 * Shows a custom alert dialog.
 * @param {string} message - The message to display.
 * @param {string} title - The title of the dialog.
 * @returns {Promise<void>} - Resolves when the user clicks OK.
 */
export function showAlert(message, title = 'Alert') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'none';
        dialogConfirmBtn.textContent = 'OK';
        
        dialogModal.style.display = 'flex';

        const onConfirm = () => {
            cleanup();
            resolve();
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        window.addEventListener('keydown', onKeyDown);
    });
}
