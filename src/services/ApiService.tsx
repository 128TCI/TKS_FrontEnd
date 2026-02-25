// services/apiService.ts
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { AxiosResponse } from 'axios';

/**
 * API Response Service
 * Handles API response validation and user notifications
 */
export class ApiService {
  /**
   * Check if API response indicates success
   * @param response - Axios response object
   * @returns boolean indicating success
   */
  static isApiSuccess(response: any): boolean {
    // Check HTTP status code (2xx range)
    if (response?.status >= 200 && response?.status < 300) {
      return true;
    }

    // Check common boolean response patterns
    if (response?.data === true) return true;
    if (response?.data?.success === true) return true;
    if (response?.data?.isSuccess === true) return true;
    if (response?.data?.status === 'success') return true;
    if (response?.data?.result === true) return true;

    return false;
  }

  /**
   * Show success modal using SweetAlert2
   * @param message - Success message to display
   * @param timer - Auto-close timer in milliseconds (default: 3000)
   */
  static async showSuccessModal(message: string, timer: number = 3000): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: timer,
      showConfirmButton: false,
    });
  }

  /**
   * Show error modal using SweetAlert2
   * @param message - Error message to display
   * @param timer - Auto-close timer in milliseconds (default: 2000)
   */
  static async showErrorModal(message: string, timer: number = 2000): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: timer,
      showConfirmButton: true,
    });
  }

  /**
   * Show warning modal using SweetAlert2
   * @param message - Warning message to display
   * @param timer - Auto-close timer in milliseconds (default: 2000)
   */
  static async showWarningModal(message: string, timer: number = 2000): Promise<void> {
    await Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: message,
      timer: timer,
      showConfirmButton: true,
    });
  }

  /**
   * Show info modal using SweetAlert2
   * @param message - Info message to display
   * @param timer - Auto-close timer in milliseconds (default: 2000)
   */
  static async showInfoModal(message: string, timer: number = 2000): Promise<void> {
    await Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
      timer: timer,
      showConfirmButton: true,
    });
  }

  /**
   * Show custom modal using SweetAlert2
   * @param icon - Icon type
   * @param title - Modal title
   * @param message - Modal message
   * @param timer - Auto-close timer in milliseconds
   * @param showConfirmButton - Show confirm button
   */
  static async showModal(
    icon: SweetAlertIcon,
    title: string,
    message: string,
    timer?: number,
    showConfirmButton: boolean = true
  ): Promise<void> {
    await Swal.fire({
      icon,
      title,
      text: message,
      timer,
      showConfirmButton,
    });
  }

  /**
   * Show confirmation dialog
   * @param message - Confirmation message
   * @param title - Dialog title (default: 'Confirm')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  static async showConfirmDialog(
    message: string,
    title: string = 'Confirm'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    return result.isConfirmed;
  }

  /**
   * Show delete confirmation dialog
   * @param message - Confirmation message (default: 'Are you sure you want to remove this employee??')
   * @param title - Dialog title (default: 'Confirm Delete')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  static async showDeleteConfirmDialog(
    message: string = 'Are you sure you want to remove this employee??',
    title: string = 'Confirm Delete'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
  }  

  /**
   * Show delete confirmation dialog
   * @param message - Confirmation message (default: 'Are you sure you want to remove this user??')
   * @param title - Dialog title (default: 'Confirm Delete')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  static async showDeleteUserConfirmDialog(
    message: string = 'Are you sure you want to remove this user?',
    title: string = 'Confirm Delete'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
  }

  /**
   * Show delete confirmation dialog
   * @param message - Confirmation message (default: 'Are you sure you want to remove this user??')
   * @param title - Dialog title (default: 'Confirm Delete')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  static async showDeleteGroupConfirmDialog(
    message: string = 'Are you sure you want to remove this user group?',
    title: string = 'Confirm Delete'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
  }

  /**
   * Show update confirmation dialog
   * @param message - Confirmation message
   * @param title - Dialog title (default: 'Confirm Update')
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  static async showUpdateConfirmDialog(
    message: string = 'Are you sure you want to update this record?',
    title: string = 'Confirm Update'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
  }

  /**
   * Extract error message from error object
   * @param error - Error object from catch block
   * @returns Formatted error message string
   */
  static extractErrorMessage(error: any): string {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    );
  }

  /**
   * Handle API error and show error modal
   * @param error - Error object from catch block
   * @param customMessage - Optional custom error message
   */
  static async handleApiError(error: any, customMessage?: string): Promise<void> {
    const errorMsg = customMessage || this.extractErrorMessage(error);
    await this.showErrorModal(errorMsg);
    console.error('API Error:', error);
  }

  /**
   * Generic API call wrapper with automatic success/error handling
   * @param apiCall - Function that returns a Promise (API call)
   * @param successMessage - Message to show on success
   * @param onSuccess - Optional callback to execute on success
   * @param onError - Optional callback to execute on error
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  static async executeWithModal<T = any>(
    apiCall: () => Promise<AxiosResponse<T>>,
    successMessage: string,
    onSuccess?: (response: AxiosResponse<T>) => void,
    onError?: (error: any) => void
  ): Promise<boolean> {
    try {
      const response = await apiCall();
      
      const isSuccess = this.isApiSuccess(response);
      
      if (isSuccess) {
        await this.showSuccessModal(successMessage);
        onSuccess?.(response);
        return true;
      } else {
        await this.showErrorModal('Operation failed. Please try again.');
        return false;
      }
    } catch (error: any) {
      await this.handleApiError(error);
      onError?.(error);
      return false;
    }
  }
}

// Export individual functions for convenience
export const {
  isApiSuccess,
  showSuccessModal,
  showErrorModal,
  showWarningModal,
  showInfoModal,
  showModal,
  showConfirmDialog,
  showDeleteConfirmDialog,
  showUpdateConfirmDialog,
  extractErrorMessage,
  handleApiError,
  executeWithModal,
} = ApiService;