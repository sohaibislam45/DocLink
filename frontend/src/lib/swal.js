import Swal from 'sweetalert2';

// Detect dark mode by checking for 'dark' class on the html element
const isDark = () => document.documentElement.classList.contains('dark');

// Base theme builder
const getTheme = () =>
  isDark()
    ? {
        background: 'rgb(13, 21, 38)',       // --bg-secondary dark
        color: 'rgb(240, 244, 255)',          // --text-primary dark
        confirmButtonColor: 'rgb(16, 185, 129)', // accent-primary
        cancelButtonColor: 'rgb(30, 41, 59)',    // --border dark (subtle)
        borderColor: 'rgba(30, 41, 59, 0.8)',
      }
    : {
        background: 'rgb(255, 255, 255)',     // --bg-secondary light
        color: 'rgb(15, 23, 42)',             // --text-primary light
        confirmButtonColor: 'rgb(16, 185, 129)',
        cancelButtonColor: 'rgb(226, 232, 240)',
        borderColor: 'rgba(226, 232, 240, 0.8)',
      };

// Base Swal instance with DocLink theming
const DocSwal = Swal.mixin({
  customClass: {
    popup: 'doclink-swal-popup',
    confirmButton: 'doclink-swal-confirm',
    cancelButton: 'doclink-swal-cancel',
  },
  buttonsStyling: true,
  showClass: {
    popup: 'swal2-show',
  },
  hideClass: {
    popup: 'swal2-hide',
  },
});

/**
 * Show a success toast (bottom end)
 */
export const showSuccess = (message) => {
  const theme = getTheme();
  DocSwal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    iconColor: 'rgb(16, 185, 129)',
  });
};

/**
 * Show an error toast (bottom end)
 */
export const showError = (message) => {
  const theme = getTheme();
  DocSwal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    iconColor: '#ef4444',
  });
};

/**
 * Show a warning toast (bottom end)
 */
export const showWarning = (message) => {
  const theme = getTheme();
  DocSwal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'warning',
    title: message,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    iconColor: '#f59e0b',
  });
};

/**
 * Show an info toast (bottom end)
 */
export const showInfo = (message) => {
  const theme = getTheme();
  DocSwal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'info',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    iconColor: 'rgb(16, 185, 129)',
  });
};

/**
 * Show a confirmation dialog and return true if confirmed
 */
export const showConfirm = async ({ title, text, confirmText = 'Yes', cancelText = 'Cancel', icon = 'warning' }) => {
  const theme = getTheme();
  const result = await DocSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: 'rgb(16, 185, 129)',
    cancelButtonColor: isDark() ? '#1e293b' : '#e2e8f0',
    background: theme.background,
    color: theme.color,
    iconColor: icon === 'warning' ? '#f59e0b' : icon === 'error' ? '#ef4444' : 'rgb(16, 185, 129)',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-3xl border border-slate-700/30 shadow-2xl',
      title: 'text-lg font-bold',
      htmlContainer: 'text-sm',
      confirmButton: 'rounded-xl px-6 py-2 font-semibold text-white',
      cancelButton: 'rounded-xl px-6 py-2 font-semibold',
    },
  });
  return result.isConfirmed;
};

// Aliases for Admin Panel (matching prompt usage)
export const swalConfirm = (title, text, confirmValue = "Confirm") => 
  DocSwal.fire({
    title, text, icon: 'warning', showCancelButton: true,
    confirmButtonText: confirmValue,
    confirmButtonColor: '#ef4444', // Admin uses red accent
    background: getTheme().background, color: getTheme().color,
    customClass: { popup: 'rounded-2xl' }
  });

export const swalSuccess = (title, message) => 
  DocSwal.fire({ title, text: message, icon: 'success', background: getTheme().background, color: getTheme().color });

export const swalError = (title, message) => 
  DocSwal.fire({ title, text: message, icon: 'error', background: getTheme().background, color: getTheme().color });

export const swalToast = (type, message) => {
  const theme = getTheme();
  DocSwal.fire({
    toast: true, position: 'bottom-end', icon: type, title: message,
    showConfirmButton: false, timer: 3000, timerProgressBar: true,
    background: theme.background, color: theme.color
  });
};
