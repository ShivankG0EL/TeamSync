import nodemailer from 'nodemailer';

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send verification email with code
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.code - Verification code
 */
export const sendVerificationEmail = async ({ email, name, code }) => {
  try {
    const mailOptions = {
      from: `"TeamSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your TeamSync Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to TeamSync, ${name}!</h2>
          <p>Thank you for signing up. To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>The TeamSync Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.token - Reset token
 */
export const sendPasswordResetEmail = async ({ email, name, token }) => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"TeamSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your TeamSync Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Hello, ${name}</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br>The TeamSync Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send password setup email for new users
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.token - Setup token
 */
export const sendSetupPasswordEmail = async ({ email, name, token }) => {
  try {
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup-password?token=${token}`;
    
    const mailOptions = {
      from: `"TeamSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Complete Your TeamSync Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to TeamSync, ${name}!</h2>
          <p>Thank you for signing up. To complete your registration, please click the button below to set up your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${setupUrl}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${setupUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not sign up for TeamSync, please ignore this email.</p>
          <p>Best regards,<br>The TeamSync Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send welcome email after successful account activation
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 */
export const sendWelcomeEmail = async ({ email, name }) => {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;
    
    const mailOptions = {
      from: `"TeamSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to TeamSync!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Welcome aboard, ${name}!</h2>
          <p>Your account has been successfully activated. You can now log in and start using TeamSync.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${loginUrl}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
          </div>
          <p>TeamSync helps you collaborate effectively with your team, manage tasks, and boost productivity.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The TeamSync Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send task assignment notification email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {Object} options.task - Task details
 * @param {string} options.leaderName - Name of the team leader who assigned the task
 */
export const sendTaskAssignmentEmail = async ({ email, name, task, leaderName }) => {
  try {
    const dueDate = new Date(task.dueDate).toLocaleString([], {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const priorityColor = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#22c55e'
    };
    
    const mailOptions = {
      from: `"TeamSync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `New Task Assigned: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">New Task Assignment</h2>
          <p>Hello, ${name}!</p>
          <p>${leaderName} has assigned you a new task in TeamSync.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3b82f6;">${task.title}</h3>
            <p style="margin-bottom: 5px;"><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <p style="margin-bottom: 5px;"><strong>Due Date:</strong> ${dueDate}</p>
            <p style="margin-bottom: 5px;"><strong>Priority:</strong> <span style="color: ${priorityColor[task.priority] || '#333'};">${task.priority.toUpperCase()}</span></p>
            <p style="margin-bottom: 0;"><strong>Status:</strong> ${task.status}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/member/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Task Details</a>
          </div>
          
          <p>Please log in to your TeamSync account to view full details and update the task status.</p>
          <p>Best regards,<br>The TeamSync Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
