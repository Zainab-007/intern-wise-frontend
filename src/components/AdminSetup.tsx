import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAdminUser } from '@/utils/createAdmin';
import { Shield, CheckCircle } from 'lucide-react';

const AdminSetup = () => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreateAdmin = async () => {
    setCreating(true);
    
    const { error } = await createAdminUser();
    
    if (error) {
      toast({
        title: "Admin Creation Failed",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Admin Created Successfully",
        description: "Admin user has been created. Email: admin@optima.gov, Password: admin123456",
      });
      setCreated(true);
    }
    
    setCreating(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="p-3 rounded-full bg-gradient-secondary w-fit mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>
          Create the first admin user for the system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!created ? (
          <>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Admin Credentials:</strong></p>
              <p>Email: admin@optima.gov</p>
              <p>Password: admin123456</p>
            </div>
            
            <Button 
              onClick={handleCreateAdmin}
              disabled={creating}
              className="w-full bg-gradient-secondary hover:opacity-90 text-white"
            >
              {creating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Admin...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Create Admin User
                </div>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Admin user created successfully! You can now use the Admin tab to login.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSetup;