import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runAllocation, getStudents, getInternships, type AllocationResult, type Student, type Internship } from '@/lib/api';
import { Settings, Play, Users, Building2, Target, Trophy } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<AllocationResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInternships: 0,
    totalAllocations: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, internshipsRes] = await Promise.all([
        getStudents(),
        getInternships(),
      ]);
      
      setStudents(studentsRes.data);
      setInternships(internshipsRes.data);
      setStats({
        totalStudents: studentsRes.data.length,
        totalInternships: internshipsRes.data.length,
        totalAllocations: allocations.length,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleRunAllocation = async () => {
    if (students.length === 0) {
      toast({
        title: "No Students Found",
        description: "Please add some students before running allocation",
        variant: "destructive",
      });
      return;
    }

    if (internships.length === 0) {
      toast({
        title: "No Internships Found",
        description: "Please add some internships before running allocation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await runAllocation();
      
      // Enrich allocation data with student and internship names
      const enrichedAllocations = result.data.map(allocation => {
        const student = students.find(s => s.id === allocation.student_id);
        const internship = internships.find(i => i.id === allocation.internship_id);
        
        return {
          ...allocation,
          student_name: student?.name || 'Unknown Student',
          org_name: internship?.org_name || 'Unknown Organization',
          sector: internship?.sector || 'Unknown Sector',
        };
      });
      
      setAllocations(enrichedAllocations);
      setStats(prev => ({ ...prev, totalAllocations: enrichedAllocations.length }));
      
      toast({
        title: "Allocation Complete!",
        description: `Successfully allocated ${enrichedAllocations.length} internships`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Allocation Failed",
        description: error instanceof Error ? error.message : "Failed to run allocation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-success text-success-foreground';
    if (score >= 0.6) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'quota': return 'bg-primary text-primary-foreground';
      case 'open': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-surface border-border/50">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Admin Dashboard</CardTitle>
              <CardDescription>
                Manage internship allocation and view results
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-semibold">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Internships</p>
                  <p className="text-2xl font-semibold">{stats.totalInternships}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Allocations</p>
                  <p className="text-2xl font-semibold">{stats.totalAllocations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-semibold">
                    {stats.totalStudents > 0 ? Math.round((stats.totalAllocations / stats.totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            onClick={handleRunAllocation}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-accent hover:opacity-90 text-white font-medium h-11"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Allocation...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Run Allocation
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      {allocations.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Allocation Results
            </CardTitle>
            <CardDescription>
              Latest internship allocation results with scoring details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((allocation, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {allocation.student_name}
                      </TableCell>
                      <TableCell>{allocation.org_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {allocation.sector}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(allocation.score)}>
                          {(allocation.score * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(allocation.allocation_type)}>
                          {allocation.allocation_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {allocation.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};