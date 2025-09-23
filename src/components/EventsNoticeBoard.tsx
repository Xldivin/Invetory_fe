import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Bell,
  AlertCircle,
  Info,
  Clock,
  Users,
  Pin,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';

// Mock events and notices
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Monthly Inventory Review',
    description: 'Quarterly review of all warehouse and shop inventory levels. All managers required to attend.',
    type: 'meeting',
    priority: 'high',
    startDate: new Date('2024-03-20T14:00:00'),
    endDate: new Date('2024-03-20T16:00:00'),
    createdBy: '2',
    targetRoles: ['admin', 'warehouse_manager', 'shop_manager'],
    isActive: true,
    createdAt: new Date('2024-03-01')
  },
  {
    id: '2',
    title: 'System Maintenance Notice',
    description: 'Scheduled maintenance for the inventory management system. System will be unavailable from 11 PM to 2 AM.',
    type: 'notice',
    priority: 'medium',
    startDate: new Date('2024-03-22T23:00:00'),
    endDate: new Date('2024-03-23T02:00:00'),
    createdBy: '1',
    targetRoles: ['super_admin', 'admin', 'warehouse_manager', 'shop_manager'],
    isActive: true,
    createdAt: new Date('2024-03-10')
  },
  {
    id: '3',
    title: 'Safety Training Session',
    description: 'Mandatory safety training for all warehouse staff. Topics include equipment operation and emergency procedures.',
    type: 'alert',
    priority: 'urgent',
    startDate: new Date('2024-03-25T09:00:00'),
    endDate: new Date('2024-03-25T12:00:00'),
    createdBy: '2',
    targetRoles: ['warehouse_manager'],
    isActive: true,
    createdAt: new Date('2024-03-12')
  },
  {
    id: '4',
    title: 'New Product Launch',
    description: 'We are excited to announce the launch of our new product line. Training materials will be provided.',
    type: 'notice',
    priority: 'medium',
    startDate: new Date('2024-03-18T00:00:00'),
    createdBy: '2',
    targetRoles: ['shop_manager'],
    isActive: true,
    createdAt: new Date('2024-03-15')
  }
];

export function EventsNoticeBoard() {
  const { user, logActivity, hasPermission } = useAuth();
  
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'notice' as 'notice' | 'alert' | 'reminder' | 'meeting',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    targetRoles: [] as string[]
  });

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      type: 'notice',
      priority: 'medium',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      targetRoles: []
    });
  };

  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.description || !eventForm.startDate) return;

    const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '09:00'}`);
    const endDateTime = eventForm.endDate 
      ? new Date(`${eventForm.endDate}T${eventForm.endTime || '17:00'}`)
      : undefined;

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventForm.title,
      description: eventForm.description,
      type: eventForm.type,
      priority: eventForm.priority,
      startDate: startDateTime,
      endDate: endDateTime,
      createdBy: user?.id || '',
      targetRoles: eventForm.targetRoles as any[],
      isActive: true,
      createdAt: new Date()
    };

    setEvents(prev => [newEvent, ...prev]);
    logActivity('event_created', 'events', { 
      title: newEvent.title, 
      type: newEvent.type 
    });
    
    resetEventForm();
    setShowAddEvent(false);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      type: event.type,
      priority: event.priority,
      startDate: event.startDate.toISOString().split('T')[0],
      startTime: event.startDate.toTimeString().slice(0, 5),
      endDate: event.endDate?.toISOString().split('T')[0] || '',
      endTime: event.endDate?.toTimeString().slice(0, 5) || '',
      targetRoles: event.targetRoles
    });
    setShowAddEvent(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !eventForm.title || !eventForm.description || !eventForm.startDate) return;

    const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime || '09:00'}`);
    const endDateTime = eventForm.endDate 
      ? new Date(`${eventForm.endDate}T${eventForm.endTime || '17:00'}`)
      : undefined;

    const updatedEvent = {
      ...editingEvent,
      title: eventForm.title,
      description: eventForm.description,
      type: eventForm.type,
      priority: eventForm.priority,
      startDate: startDateTime,
      endDate: endDateTime,
      targetRoles: eventForm.targetRoles as any[]
    };

    setEvents(prev => prev.map(e => e.id === editingEvent.id ? updatedEvent : e));
    logActivity('event_updated', 'events', { 
      title: updatedEvent.title, 
      type: updatedEvent.type 
    });
    
    resetEventForm();
    setEditingEvent(null);
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (event: Event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      logActivity('event_deleted', 'events', { 
        title: event.title, 
        type: event.type 
      });
    }
  };

  const handleToggleActive = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isActive: !event.isActive }
        : event
    ));
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, icon: <Info className="w-3 h-3" /> },
      medium: { variant: 'outline' as const, icon: <Bell className="w-3 h-3" /> },
      high: { variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> },
      urgent: { variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge variant={config.variant}>
        {config.icon}
        <span className="ml-1 capitalize">{priority}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      notice: { variant: 'secondary' as const, icon: <Info className="w-3 h-3" /> },
      alert: { variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> },
      reminder: { variant: 'outline' as const, icon: <Clock className="w-3 h-3" /> },
      meeting: { variant: 'default' as const, icon: <Users className="w-3 h-3" /> }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge variant={config.variant}>
        {config.icon}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
    const matchesRole = event.targetRoles.includes(user?.role || '');
    
    return matchesSearch && matchesType && matchesPriority && matchesRole;
  });

  const upcomingEvents = events.filter(event => 
    event.isActive && 
    event.startDate > new Date() &&
    event.targetRoles.includes(user?.role || '')
  ).slice(0, 5);

  const activeNotices = events.filter(event => 
    event.isActive && 
    event.type === 'notice' &&
    event.targetRoles.includes(user?.role || '')
  ).slice(0, 3);

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'warehouse_manager', label: 'Warehouse Manager' },
    { value: 'shop_manager', label: 'Shop Manager' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Events & Notice Board</h1>
          <p className="text-muted-foreground">Manage announcements, events, and important notices</p>
        </div>
        {hasPermission('events.create') && (
          <Dialog open={showAddEvent} onOpenChange={(open) => {
            setShowAddEvent(open);
            if (!open) {
              setEditingEvent(null);
              resetEventForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Event Title</Label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Type</Label>
                      <Select value={eventForm.type} onValueChange={(value: any) => setEventForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notice">Notice</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={eventForm.priority} onValueChange={(value: any) => setEventForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>End Date (optional)</Label>
                      <Input
                        type="date"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description"
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label>Target Roles</Label>
                    <div className="space-y-2 mt-2">
                      {roleOptions.map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={role.value}
                            checked={eventForm.targetRoles.includes(role.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEventForm(prev => ({
                                  ...prev,
                                  targetRoles: [...prev.targetRoles, role.value]
                                }));
                              } else {
                                setEventForm(prev => ({
                                  ...prev,
                                  targetRoles: prev.targetRoles.filter(r => r !== role.value)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={role.value} className="text-sm">
                            {role.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancel
                </Button>
                <Button onClick={editingEvent ? handleUpdateEvent : handleAddEvent}>
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="board" className="space-y-6">
        <TabsList>
          <TabsTrigger value="board">Notice Board</TabsTrigger>
          <TabsTrigger value="events">All Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-6">
          {/* Notice Board Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm">{event.title}</h4>
                              {getTypeBadge(event.type)}
                              {getPriorityBadge(event.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {event.startDate.toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <Pin className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Notices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeNotices.map((notice) => (
                    <Card key={notice.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm">{notice.title}</h5>
                          {getPriorityBadge(notice.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notice.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {notice.startDate.toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {activeNotices.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No active notices</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="notice">Notice</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={!event.isActive ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm">{event.title}</h4>
                      {hasPermission('events.edit') && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {getTypeBadge(event.type)}
                      {getPriorityBadge(event.priority)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.startDate.toLocaleDateString()}
                      </div>
                      {event.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={event.isActive ? 'text-green-600' : 'text-gray-500'}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {hasPermission('events.edit') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(event.id)}
                        >
                          {event.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Visual calendar representation of events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <h4>Calendar View</h4>
                <p>Advanced calendar view would be implemented here</p>
                <p className="text-sm">Integration with calendar libraries like FullCalendar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}