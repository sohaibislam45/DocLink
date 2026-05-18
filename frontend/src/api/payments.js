import axiosClient from "../lib/axiosClient.js";

/**
 * Creates a Stripe Checkout session for consultation connection.
 * @param {Object} data - Intake form details: { doctorId, patientName, reason }
 * @returns {Promise<{url: string, sessionId: string}>}
 */
export const createCheckoutSession = (data) => {
  return axiosClient.post("/payments/create-checkout-session", data);
};

/**
 * Verifies the status of a checkout session and retrieves waitlist information.
 * @param {string} sessionId - The Stripe checkout session ID.
 * @returns {Promise<{payment: Object, queueEntry: Object}>}
 */
export const verifyPayment = (sessionId) => {
  return axiosClient.get(`/payments/verify?sessionId=${sessionId}`);
};

/**
 * Retrieves the logged-in user's payment history.
 * @returns {Promise<Array<Object>>}
 */
export const fetchMyPayments = () => {
  return axiosClient.get("/payments/my");
};

/**
 * Cancels a pending or failed payment.
 * @param {string} paymentId - The database ID of the payment.
 * @returns {Promise<{message: string, payment: Object}>}
 */
export const cancelPayment = (paymentId) => {
  return axiosClient.post(`/payments/${paymentId}/cancel`);
};
