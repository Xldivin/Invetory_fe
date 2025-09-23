import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { IncidentReport } from '../types';

// Mock incident reports
const mockIncidents: IncidentReport[] = [
  {
    id: '1',
    title: 'Equipment malfunction in warehouse',
    description: 'Forklift #3 experiencing hydraulic issues causing delays in operations',
    severity: 'high',
    type: 'system',
    location: 'Main Warehouse - Loading Bay 2',
    reportedBy: '3',
    assignedTo: '2',
    status: 'investigating',
    attachments: [],
    createdAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T14:20:00')
  },
  {
    id: '2',
    title: 'Minor theft incident',
    description: 'Missing office supplies from storage room, estimated value $150',
    severity: 'medium',
    type: 'theft',
    location: 'Downtown Store - Storage Room',
    reportedBy: '4',
    status: 'open',
    attachments: [],
    createdAt: new Date('2024-03-14T16:45:00'),
    updatedAt: new Date('2024-03-14T16:45:00')
  },
  {
    id: '3',
    title: 'Safety hazard - wet floor',
    description: 'Ongoing leak from ceiling causing slippery conditions near entrance',
    severity: 'critical',
    type: 'safety',
    location: 'Downtown Store - Main Entrance',
    reportedBy: '4',
    assignedTo: '2',
    status: 'resolved',
    attachments: ['photo1.jpg'],
    createdAt: new Date('2024-03-13T09:15:00'),
    updatedAt: new Date('2024-03-13T15:30:00')
  }
];

export function IncidentReports() {
  const { user, logActivity } = useAuth();
  
  const [incidents, setIncidents] = useState<IncidentReport[]>(mockIncidents);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    type: 'other' as 'damage' | 'theft' | 'safety' | 'system' | 'other',
    location: '',
    assignedTo: ''
  });

  const resetIncidentForm = () => {
    setIncidentForm({
      title: '',
      description: '',
      severity: 'medium',
      type: 'other',
      location: '',
      assignedTo: ''
    });
  };

  const handleAddIncident = () => {
    if (!incidentForm.title || !incidentForm.description || !incidentForm.location) return;

    const newIncident: IncidentReport = {
      id: Date.now().toString(),
      title: incidentForm.title,
      description: incidentForm.description,
      severity: incidentForm.severity,
      type: incidentForm.type,
      location: incidentForm.location,
      reportedBy: user?.id || '',
      assignedTo: incidentForm.assignedTo || undefined,
      status: 'open',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setIncidents(prev => [newIncident, ...prev]);
    logActivity('incident_reported', 'incidents', { 
      title: newIncident.title, 
      severity: newIncident.severity 
    });
    
    resetIncidentForm();
    setShowAddIncident(false);
  };

  const handleUpdateStatus = (incidentId: string, newStatus: 'open' | 'investigating' | 'resolved' | 'closed') => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: newStatus, updatedAt: new Date() }
        : incident
    ));
    
    logActivity('incident_status_updated', 'incidents', { 
      incidentId, 
      newStatus 
    });
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { variant: 'secondary' as const, color: 'text-blue-600', icon: <AlertCircle className="w-3 h-3" /> },
      medium: { variant: 'outline' as const, color: 'text-orange-600', icon: <AlertTriangle className="w-3 h-3" /> },
      high: { variant: 'destructive' as const, color: 'text-red-600', icon: <AlertTriangle className="w-3 h-3" /> },
      critical: { variant: 'destructive' as const, color: 'text-red-800', icon: <AlertTriangle className="w-3 h-3" /> }
    };

    const config = severityConfig[severity as keyof typeof severityConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.icon}
        <span className="ml-1 capitalize">{severity}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Open</Badge>;
      case 'investigating':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Investigating</Badge>;
      case 'resolved':
        return <Badge><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getStatsCounts = () => {
    return {
      total: incidents.length,
      open: incidents.filter(i => i.status === 'open').length,
      investigating: incidents.filter(i => i.status === 'investigating').length,
      critical: incidents.filter(i => i.severity === 'critical' && i.status !== 'closed').length
    };
  };

  const stats = getStatsCounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Incident Reports</h1>
          <p className="text-muted-foreground">Track and manage workplace incidents and issues</p>
        </div>
        <Dialog open={showAddIncident} onOpenChange={setShowAddIncident}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Incident Title</Label>
                <Input
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the incident"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Select value={incidentForm.severity} onValueChange={(value: any) => setIncidentForm(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={incidentForm.type} onValueChange={(value: any) => setIncidentForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damage">Property Damage</SelectItem>
                      <SelectItem value="theft">Theft/Security</SelectItem>
                      <SelectItem value="safety">Safety Hazard</SelectItem>
                      <SelectItem value="system">System/Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={incidentForm.location}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Specific location where incident occurred"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of what happened"
                  rows={4}
                />
              </div>
              <div>
                <Label>Assign To (optional)</Label>
                <Select value={incidentForm.assignedTo} onValueChange={(value) => setIncidentForm(prev => ({ ...prev, assignedTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">John Admin</SelectItem>
                    <SelectItem value="3">Mike Warehouse</SelectItem>
                    <SelectItem value="4">Sarah Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddIncident} className="w-full">
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl text-orange-600">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-2xl text-blue-600">{stats.investigating}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>All reported incidents and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm">{incident.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-48">
                        {incident.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {incident.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell className="text-sm">
                    {incident.location}
                  </TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell className="text-sm">
                    {incident.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.updatedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {incident.status !== 'closed' && (
                        <Select
                          value={incident.status}
                          onValueChange={(value: any) => handleUpdateStatus(incident.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Incident Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p className="text-sm">{selectedIncident.title}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedIncident.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedIncident.severity)}</div>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm capitalize">{selectedIncident.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <p className="text-sm">{selectedIncident.location}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedIncident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reported On</Label>
                  <p className="text-sm">{selectedIncident.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm">{selectedIncident.updatedAt.toLocaleString()}</p>
                </div>
              </div>
              {selectedIncident.attachments.length > 0 && (
                <div>
                  <Label>Attachments</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedIncident.attachments.map((attachment, index) => (
                      <Badge key={index} variant="outline">
                        <Camera className="w-3 h-3 mr-1" />
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}