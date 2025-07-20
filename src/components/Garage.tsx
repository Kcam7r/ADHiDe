import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, ChevronDown, ChevronUp, Pause, Target, CheckCircle } from 'lucide-react';
import { Project } from '../types';
import { Carousel } from './Carousel'; // Import Carousel

export const Garage: React.FC = () => {
  const { projects, addProject, addTaskToProject, activateMission, deactivateMission } = useApp();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showTaskForms, setShowTaskForms] = useState<Set<string>>(new Set());

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'idea' as Project['status'],
    priority: 'medium' as Project['priority']
  });

  const [taskForms, setTaskForms] = useState<{[key: string]: any}>({});

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectForm.name.trim()) {
      addProject(projectForm);
      setProjectForm({ name: '', description: '', status: 'idea', priority: 'medium' });
      setShowProjectForm(false);
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleTaskForm = (projectId: string) => {
    const newForms = new Set(showTaskForms);
    if (newForms.has(projectId)) {
      newForms.delete(projectId);
    } else {
      newForms.add(projectId);
      setTaskForms({
        ...taskForms,
        [projectId]: {
          title: '',
          description: '',
          priority: 'normal',
          energy: 'medium'
        }
      });
    }
    setShowTaskForms(newForms);
  };

  const handleAddTask = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const taskForm = taskForms[projectId];
    if (taskForm?.title.trim()) {
      addTaskToProject(projectId, taskForm);
      setTaskForms({
        ...taskForms,
        [projectId]: { title: '', description: '', priority: 'normal', energy: 'medium' }
      });
      setShowTaskForms(new Set([...showTaskForms].filter(id => id !== projectId)));
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'idea': return 'bg-gray-600';
      case 'in_progress': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      case 'completed': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'idea': return 'Pomysł';
      case 'in_progress': return 'W toku';
      case 'paused': return 'Wstrzymany';
      case 'completed': return 'Zakończony';
      default: return 'Nieznany';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getProgressPercentage = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(task => task.completed).length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  return (
    <div className="flex-1 p-6 bg-gray-900 h-full"> {/* Zmieniono min-h-screen na h-full */}
      <div className="max-w-6xl mx-auto h-full flex flex-col"> {/* Dodano h-full i flex flex-col */}
        <h1 className="text-3xl font-bold text-white mb-8">Garaż</h1>
        
        <div className="mb-6">
          <button
            onClick={() => setShowProjectForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg active:scale-[0.98] active:brightness-110"
          >
            <Plus className="w-5 h-5" />
            <span>Nowy Projekt</span>
          </button>
        </div>

        {/* Project Form */}
        {showProjectForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl border border-gray-700">
            <form onSubmit={handleAddProject}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nazwa projektu
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                    placeholder="np. Nowa strona internetowa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="idea">Pomysł</option>
                    <option value="in_progress">W toku</option>
                    <option value="paused">Wstrzymany</option>
                    <option value="completed">Zakończony</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                    rows={3}
                    placeholder="Opisz swój projekt..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorytet
                  </label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value as Project['priority'] })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="low">Niski</option>
                    <option value="medium">Średni</option>
                    <option value="high">Wysoki</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                >
                  Dodaj Projekt
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4 flex-1 overflow-y-auto min-h-0"> {/* Dodano flex-1 overflow-y-auto min-h-0 */}
          {projects.length > 9 ? (
            <Carousel className="h-full">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 hover:border-cyan-600 transition-all duration-300 
                hover:translate-y-[-2px] hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400">Postęp</span>
                          <span className="text-sm text-gray-400">
                            {project.tasks.filter(t => t.completed).length} / {project.tasks.length} zadań
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-700 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${getProgressPercentage(project)}%` }}
                          >
                            {getProgressPercentage(project) > 10 && (
                              <span className="text-xs font-bold text-white drop-shadow-sm">
                                {getProgressPercentage(project)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-gray-300 mb-3">{project.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleProjectExpansion(project.id)}
                      className="text-gray-400 hover:text-white transition-colors ml-4 p-2 rounded-full hover:bg-gray-700 active:scale-[0.98] active:brightness-110"
                    >
                      {expandedProjects.has(project.id) ? 
                        <ChevronUp className="w-6 h-6" /> : 
                        <ChevronDown className="w-6 h-6" />
                      }
                    </button>
                  </div>

                  {expandedProjects.has(project.id) && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Zadania Projektu</h4>
                        <button
                          onClick={() => toggleTaskForm(project.id)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Dodaj Zadanie</span>
                        </button>
                      </div>

                      {/* Task Form */}
                      {showTaskForms.has(project.id) && (
                        <form onSubmit={(e) => handleAddTask(project.id, e)} className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tytuł zadania
                              </label>
                              <input
                                type="text"
                                value={taskForms[project.id]?.title || ''}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], title: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                                placeholder="np. Zaprojektować header"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Priorytet
                              </label>
                              <select
                                value={taskForms[project.id]?.priority || 'normal'}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], priority: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                              >
                                <option value="normal">Normalny</option>
                                <option value="important">Ważny</option>
                                <option value="urgent">Pilny</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Opis (opcjonalnie)
                              </label>
                              <textarea
                                value={taskForms[project.id]?.description || ''}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], description: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                                rows={2}
                                placeholder="Szczegóły zadania..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Wymagana energia
                              </label>
                              <select
                                value={taskForms[project.id]?.energy || 'medium'}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], energy: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                              >
                                <option value="low">Niska</option>
                                <option value="medium">Średnia</option>
                                <option value="high">Wysoka</option>
                                <option value="concentration">Koncentracja</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-4">
                            <button
                              type="submit"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                            >
                              Dodaj
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleTaskForm(project.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                            >
                              Anuluj
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Tasks List */}
                      {project.tasks.length > 5 ? (
                        <Carousel className="h-64"> {/* Ograniczona wysokość dla karuzeli zadań */}
                          {project.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border transition-all duration-200 
                              hover:translate-y-[-1px] hover:shadow-md
                              ${
                                task.completed 
                                  ? 'bg-gray-700 border-green-500 opacity-70' 
                                  : task.isActive 
                                    ? 'bg-cyan-700 border-cyan-500 shadow-md' 
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex-1">
                                <h5 className={`font-medium ${
                                  task.completed ? 'line-through text-gray-400' : 'text-white'
                                }`}>
                                  {task.title}
                                </h5>
                                {task.description && (
                                  <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.priority}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.energy}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {task.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <button
                                    onClick={() => task.isActive ? deactivateMission(task.id) : activateMission(task.id)}
                                    className={`p-2 rounded-full transition-colors shadow-sm active:scale-[0.98] active:brightness-110 ${
                                      task.isActive
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                  >
                                    {task.isActive ? (
                                      <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                      <Target className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </Carousel>
                      ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                          {project.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border transition-all duration-200 
                              hover:translate-y-[-1px] hover:shadow-md
                              ${
                                task.completed 
                                  ? 'bg-gray-700 border-green-500 opacity-70' 
                                  : task.isActive 
                                    ? 'bg-cyan-700 border-cyan-500 shadow-md' 
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex-1">
                                <h5 className={`font-medium ${
                                  task.completed ? 'line-through text-gray-400' : 'text-white'
                                }`}>
                                  {task.title}
                                </h5>
                                {task.description && (
                                  <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.priority}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.energy}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {task.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <button
                                    onClick={() => task.isActive ? deactivateMission(task.id) : activateMission(task.id)}
                                    className={`p-2 rounded-full transition-colors shadow-sm active:scale-[0.98] active:brightness-110 ${
                                      task.isActive
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                  >
                                    {task.isActive ? (
                                      <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                      <Target className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {project.tasks.length === 0 && (
                            <div className="text-gray-400 text-center py-4">
                              <p>Brak zadań w tym projekcie</p>
                              <p className="text-sm mt-1">Dodaj pierwsze zadanie powyżej!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 hover:border-cyan-600 transition-all duration-300 
                hover:translate-y-[-2px] hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400">Postęp</span>
                          <span className="text-sm text-gray-400">
                            {project.tasks.filter(t => t.completed).length} / {project.tasks.length} zadań
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-700 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${getProgressPercentage(project)}%` }}
                          >
                            {getProgressPercentage(project) > 10 && (
                              <span className="text-xs font-bold text-white drop-shadow-sm">
                                {getProgressPercentage(project)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-gray-300 mb-3">{project.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleProjectExpansion(project.id)}
                      className="text-gray-400 hover:text-white transition-colors ml-4 p-2 rounded-full hover:bg-gray-700 active:scale-[0.98] active:brightness-110"
                    >
                      {expandedProjects.has(project.id) ? 
                        <ChevronUp className="w-6 h-6" /> : 
                        <ChevronDown className="w-6 h-6" />
                      }
                    </button>
                  </div>

                  {expandedProjects.has(project.id) && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Zadania Projektu</h4>
                        <button
                          onClick={() => toggleTaskForm(project.id)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Dodaj Zadanie</span>
                        </button>
                      </div>

                      {/* Task Form */}
                      {showTaskForms.has(project.id) && (
                        <form onSubmit={(e) => handleAddTask(project.id, e)} className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tytuł zadania
                              </label>
                              <input
                                type="text"
                                value={taskForms[project.id]?.title || ''}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], title: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                                placeholder="np. Zaprojektować header"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Priorytet
                              </label>
                              <select
                                value={taskForms[project.id]?.priority || 'normal'}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], priority: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                              >
                                <option value="normal">Normalny</option>
                                <option value="important">Ważny</option>
                                <option value="urgent">Pilny</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Opis (opcjonalnie)
                              </label>
                              <textarea
                                value={taskForms[project.id]?.description || ''}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], description: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                                rows={2}
                                placeholder="Szczegóły zadania..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Wymagana energia
                              </label>
                              <select
                                value={taskForms[project.id]?.energy || 'medium'}
                                onChange={(e) => setTaskForms({
                                  ...taskForms,
                                  [projectId]: { ...taskForms[projectId], energy: e.target.value }
                                })}
                                className="w-full p-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                              >
                                <option value="low">Niska</option>
                                <option value="medium">Średnia</option>
                                <option value="high">Wysoka</option>
                                <option value="concentration">Koncentracja</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-4">
                            <button
                              type="submit"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                            >
                              Dodaj
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleTaskForm(project.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md active:scale-[0.98] active:brightness-110"
                            >
                              Anuluj
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Tasks List */}
                      {project.tasks.length > 5 ? (
                        <Carousel className="h-64"> {/* Ograniczona wysokość dla karuzeli zadań */}
                          {project.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border transition-all duration-200 
                              hover:translate-y-[-1px] hover:shadow-md
                              ${
                                task.completed 
                                  ? 'bg-gray-700 border-green-500 opacity-70' 
                                  : task.isActive 
                                    ? 'bg-cyan-700 border-cyan-500 shadow-md' 
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex-1">
                                <h5 className={`font-medium ${
                                  task.completed ? 'line-through text-gray-400' : 'text-white'
                                }`}>
                                  {task.title}
                                </h5>
                                {task.description && (
                                  <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.priority}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.energy}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {task.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <button
                                    onClick={() => task.isActive ? deactivateMission(task.id) : activateMission(task.id)}
                                    className={`p-2 rounded-full transition-colors shadow-sm active:scale-[0.98] active:brightness-110 ${
                                      task.isActive
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                  >
                                    {task.isActive ? (
                                      <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                      <Target className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </Carousel>
                      ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                          {project.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg border transition-all duration-200 
                              hover:translate-y-[-1px] hover:shadow-md
                              ${
                                task.completed 
                                  ? 'bg-gray-700 border-green-500 opacity-70' 
                                  : task.isActive 
                                    ? 'bg-cyan-700 border-cyan-500 shadow-md' 
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex-1">
                                <h5 className={`font-medium ${
                                  task.completed ? 'line-through text-gray-400' : 'text-white'
                                }`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.priority}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                                    {task.energy}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {task.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <button
                                    onClick={() => task.isActive ? deactivateMission(task.id) : activateMission(task.id)}
                                    className={`p-2 rounded-full transition-colors shadow-sm active:scale-[0.98] active:brightness-110 ${
                                      task.isActive
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                  >
                                    {task.isActive ? (
                                      <Pause className="w-4 h-4 text-white" />
                                    ) : (
                                      <Target className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {project.tasks.length === 0 && (
                            <div className="text-gray-400 text-center py-4">
                              <p>Brak zadań w tym projekcie</p>
                              <p className="text-sm mt-1">Dodaj pierwsze zadanie powyżej!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {projects.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 text-gray-400 text-center py-16 shadow-xl border border-gray-700">
              <p className="text-lg">Brak projektów w garażu</p>
              <p className="text-sm mt-2">Dodaj swój pierwszy projekt, aby rozpocząć organizację!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};