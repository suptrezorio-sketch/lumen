import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Play, 
  Settings, 
  Radio, 
  FileText, 
  Shield, 
  CreditCard,
  Volume2,
  LayoutDashboard,
  Clock,
  Activity,
  Bell
} from 'lucide-react';

// Import Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function DirectorConsole() {
  const [activeTab, setActiveTab] = useState('users');
  const [recordingStatus, setRecordingStatus] = useState(false);
  const [theaterMode, setTheaterMode] = useState(true);
  const [monitoringUsers, setMonitoringUsers] = useState([
    { id: 1, name: 'User_4532', screen: '/transfers', action: 'Entering amount', scenario: 'Crypto Frozen Funds', step: 4/9, status: 'active' },
    { id: 2, name: 'User_8821', screen: '/cards', action: 'Viewing card details', scenario: 'Fraud Investigation', step: 2/5, status: 'paused' },
    { id: 3, name: 'User_1129', screen: '/home', action: 'Idle', scenario: 'Large Inheritance', step: 1/4, status: 'active' },
  ]);

  const stats = {
    totalUsers: 156,
    activeScenarios: 23,
    completedToday: 45,
    inProgress: 12,
    successRate: '94.2%'
  };

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">DIRECTOR</h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4 mr-2" />
            User Management
          </Button>
          <Button
            variant={activeTab === 'scenarios' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('scenarios')}
          >
            <Play className="w-4 h-4 mr-2" />
            Scenarios
          </Button>
          <Button
            variant={activeTab === 'audio' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('audio')}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Audio Library
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'monitoring' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('monitoring')}
          >
            <Activity className="w-4 h-4 mr-2" />
            Live Monitoring
          </Button>
          <Button
            variant={activeTab === 'financial' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('financial')}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Financial Control
          </Button>
        </nav>

        {/* Theater Mode Toggle */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-400" />
              <span className="text-sm">Theater Mode</span>
            </div>
            <Switch checked={theaterMode} onCheckedChange={setTheaterMode} />
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-zinc-800">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-950/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                {stats.activeScenarios} Active Scenarios
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.activeScenarios}</p>
                <p className="text-xs text-zinc-400">Active</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-500">{stats.successRate}</p>
                <p className="text-xs text-zinc-400">Success Rate</p>
              </div>
              <Button variant="secondary" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        <p className="text-xs text-zinc-400">Total Users</p>
                      </div>
                      <Users className="w-8 h-8 text-zinc-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-500">{stats.inProgress}</p>
                        <p className="text-xs text-zinc-400">In Progress</p>
                      </div>
                      <Play className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{stats.completedToday}</p>
                        <p className="text-xs text-zinc-400">Completed Today</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-500">{stats.successRate}</p>
                        <p className="text-xs text-zinc-400">Success Rate</p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Monitoring Table */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active User Sessions</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Activity className="w-4 h-4 mr-2" />
                        Full Monitor
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {monitoringUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-zinc-400">{user.screen}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-zinc-400">{user.action}</p>
                            <p className="text-xs text-zinc-500">{user.scenario}</p>
                          </div>
                          <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                            {user.step}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Activity className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Scenario Library</h3>
                <Button>Create New Scenario</Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Crypto Frozen Funds', 'Fraud Investigation', 'Large Inheritance', 'Business Account Setup'].map((scenario) => (
                  <Card key={scenario} className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base">{scenario}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-400">Medium difficulty • 2-3 days</p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="secondary" size="sm">Edit</Button>
                        <Button variant="secondary" size="sm">Duplicate</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Audio Library</h3>
                <div className="flex items-center gap-2">
                  <Switch checked={recordingStatus} onCheckedChange={setRecordingStatus} />
                  <span className="text-sm text-zinc-400">Recording Mode</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['Sarah Johnson', 'Mike Thompson', 'Jennifer Lee'].map((character) => (
                  <Card key={character} className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-base">{character}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['Greeting', 'Fraud Alert', 'Account Verified'].map((recording) => (
                          <div key={recording} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                            <span className="text-sm">{recording}</span>
                            <Button variant="ghost" size="sm">
                              <Volume2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Live Monitoring Dashboard</h3>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-zinc-400">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Real-time monitoring interface</p>
                    <p className="text-sm mt-2">Select a user from the Users tab to view detailed monitoring</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
