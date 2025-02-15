import { User } from '../userSchema';
import { connect } from '../../dbConfig';

export async function createOrUpdateUser(userData) {
  try {
    await connect();
    
    const { email, name, image, provider } = userData;
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      const updates = {
        name,
        image,
        [`is${provider}`]: true,
        provider,
        updatedAt: new Date()
      };
      
      return await User.findOneAndUpdate(
        { email },
        updates,
        { new: true }
      );
    }

    const newUser = new User({
      email,
      name,
      image,
      [`is${provider}`]: true,
      provider
    });

    return await newUser.save();
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
}

export async function checkUserLoginType(email) {
  try {
    await connect();
    const user = await User.findOne({ email });
    
    if (!user) return { exists: false };
    
    if (user.isGoogle) return { exists: true, type: 'Google' };
    if (user.isGithub) return { exists: true, type: 'Github' };
    if (user.password) return { exists: true, type: 'Manual' };
    
    return { exists: true, type: 'Unknown' };
  } catch (error) {
    console.error('Error checking user login type:', error);
    throw error;
  }
}
