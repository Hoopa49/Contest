class EmailService {
  async sendEmail(subject, message) {
    // Временно только логируем сообщения
    console.log('Email notification:', {
      subject,
      message
    });
  }
}

module.exports = new EmailService(); 