// Utility to create admin user - for development/testing only
import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    // Sign up as admin
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@optima.gov',
      password: 'admin123456',
      options: {
        data: {
          full_name: 'Admin User'
        }
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { error };
    }

    // Update the profile to set role as admin
    if (data.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', data.user.id);

      if (updateError) {
        console.error('Error updating admin role:', updateError);
        return { error: updateError };
      }
    }

    console.log('Admin user created successfully');
    return { data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { error: err };
  }
};