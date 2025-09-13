import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addInternship, type Internship } from '@/lib/api';
import { Building2, MapPin, Users, Settings } from 'lucide-react';

export const InternshipForm: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Internship, 'id'>>({
    org_name: '',
    sector: '',
    skills_required: '',
    seats: 1,
    quota_json: { GEN: 1, SC: 0, ST: 0, OBC: 0, EWS: 0 },
    location: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string | number | Record<string, number>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuotaChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      quota_json: { ...prev.quota_json, [category]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.org_name || !formData.sector || !formData.skills_required || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.seats < 1) {
      toast({
        title: "Validation Error",
        description: "Number of seats must be at least 1",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addInternship(formData);
      toast({
        title: "Success!",
        description: "Internship added successfully",
        variant: "default",
      });
      
      // Reset form
      setFormData({
        org_name: '',
        sector: '',
        skills_required: '',
        seats: 1,
        quota_json: { GEN: 1, SC: 0, ST: 0, OBC: 0, EWS: 0 },
        location: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add internship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-accent">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Add Internship</CardTitle>
            <CardDescription>
              Create new internship opportunities for students
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Organization Details
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org_name">Organization Name *</Label>
                <Input
                  id="org_name"
                  value={formData.org_name}
                  onChange={(e) => handleInputChange('org_name', e.target.value)}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector">Sector *</Label>
                <Input
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  placeholder="e.g., Technology, Finance, Healthcare"
                  required
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Settings className="h-4 w-4" />
              Requirements
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills_required">Required Skills *</Label>
                <Input
                  id="skills_required"
                  value={formData.skills_required}
                  onChange={(e) => handleInputChange('skills_required', e.target.value)}
                  placeholder="e.g., Python, JavaScript, React"
                  required
                />
                <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seats and Quota */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Seats & Quota
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Total Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  value={formData.seats}
                  onChange={(e) => handleInputChange('seats', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label>Category-wise Quota</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(formData.quota_json).map(([category, count]) => (
                    <div key={category} className="space-y-1">
                      <Label htmlFor={`quota_${category}`} className="text-xs">
                        {category}
                      </Label>
                      <Input
                        id={`quota_${category}`}
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleQuotaChange(category, parseInt(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Set quota for each category. Total quota should not exceed total seats.
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-accent hover:opacity-90 text-white font-medium h-11"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding Internship...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Add Internship
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};