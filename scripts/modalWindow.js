// import { Modal } from 'bootstrap';

const errorModal = document.getElementById('errorModal')
const errorModalInput = document.getElementById("errorModalBody")
const errorModalTitle = document.getElementById("errorModalTitle")


export function setErrorModal(errorCode, errorMsg) {
  errorModalTitle.textContent = `Error Code: ${errorCode}`;
  errorModalInput.textContent = errorMsg; 
  // const errorModal = new Modal(errorModal);
}