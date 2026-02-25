'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

// Global app state for cross-page data sharing
interface AppState {
  // Tasks
  selectedTaskId: string | null
  taskRefreshKey: number
  
  // Projects
  selectedProjectId: string | null
  
  // Content
  selectedContentId: string | null
  
  // Agents
  selectedAgentId: string | null
  
  // UI State
  sidebarCollapsed: boolean
  activeView: string
}

interface AppContextType extends AppState {
  // Task actions
  setSelectedTaskId: (id: string | null) => void
  refreshTasks: () => void
  
  // Project actions
  setSelectedProjectId: (id: string | null) => void
  
  // Content actions
  setSelectedContentId: (id: string | null) => void
  
  // Agent actions
  setSelectedAgentId: (id: string | null) => void
  
  // UI actions
  toggleSidebar: () => void
  setActiveView: (view: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    selectedTaskId: null,
    taskRefreshKey: 0,
    selectedProjectId: null,
    selectedContentId: null,
    selectedAgentId: null,
    sidebarCollapsed: false,
    activeView: 'home',
  })

  // Task actions
  const setSelectedTaskId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedTaskId: id }))
  }, [])

  const refreshTasks = useCallback(() => {
    setState(prev => ({ ...prev, taskRefreshKey: prev.taskRefreshKey + 1 }))
  }, [])

  // Project actions
  const setSelectedProjectId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedProjectId: id }))
  }, [])

  // Content actions
  const setSelectedContentId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedContentId: id }))
  }, [])

  // Agent actions
  const setSelectedAgentId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedAgentId: id }))
  }, [])

  // UI actions
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])

  const setActiveView = useCallback((view: string) => {
    setState(prev => ({ ...prev, activeView: view }))
  }, [])

  const value: AppContextType = {
    ...state,
    setSelectedTaskId,
    refreshTasks,
    setSelectedProjectId,
    setSelectedContentId,
    setSelectedAgentId,
    toggleSidebar,
    setActiveView,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

// Hook for task-related cross-page actions
export function useTaskIntegration() {
  const { selectedTaskId, setSelectedTaskId, refreshTasks, taskRefreshKey } = useApp()
  
  const navigateToTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
    // Could also navigate to tasks page
  }, [setSelectedTaskId])
  
  return {
    selectedTaskId,
    setSelectedTaskId,
    refreshTasks,
    taskRefreshKey,
    navigateToTask,
  }
}

// Hook for project-related cross-page actions
export function useProjectIntegration() {
  const { selectedProjectId, setSelectedProjectId } = useApp()
  
  const navigateToProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
  }, [setSelectedProjectId])
  
  return {
    selectedProjectId,
    setSelectedProjectId,
    navigateToProject,
  }
}

// Hook for agent-related cross-page actions
export function useAgentIntegration() {
  const { selectedAgentId, setSelectedAgentId } = useApp()
  
  const navigateToAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
  }, [setSelectedAgentId])
  
  return {
    selectedAgentId,
    setSelectedAgentId,
    navigateToAgent,
  }
}
