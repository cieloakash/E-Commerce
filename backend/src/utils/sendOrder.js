import { createTransport } from "nodemailer";

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASS,
  },
});

export const OrderService = {
  sendOrderDetail: async (email, subject, orderId, products, totalAmount) => {
    try {
      const productHtml = products
        .map(
          (product) => `
        <tr>
          <td style="padding:10px; border:1px solid #ddd;">${product.name}</td>
          <td style="padding:10px; border:1px solid #ddd;">${product.quantity}</td>
          <td style="padding:10px; border:1px solid #ddd;">₹${product.price}</td>
        </tr>
      `
        )
        .join("");

      const htmlContent = `
        <h2>🛍️ Order Confirmation - ID: ${orderId}</h2>
        <p>Thank you for your purchase! Here are the details of your order:</p>
        <table border="1" cellspacing="0" cellpadding="8">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${productHtml}
          </tbody>
        </table>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p>If you have any questions, reply to this email. We're here to help!</p>
      `;
      const mailSendDetail = {
        from: '"cielo"', // Sender address
        to: email,
        subject: subject,
        text: `Order ID: ${orderId} - Total Amount: ₹${totalAmount}`,
        html: htmlContent,
      };

      const info = await transport.sendMail(mailSendDetail);
      return {
        sucess: true,
        message: "order-info sent successfully.",
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to send info .",
        error: error.message,
      };
    }
  },
};
