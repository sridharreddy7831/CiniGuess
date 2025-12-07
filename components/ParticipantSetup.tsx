
import React, { useState } from 'react';
import { Users, UserPlus, ArrowRight, Shuffle, Trash2, GripVertical, User, RefreshCw, LogOut, Edit2, ArrowLeft } from 'lucide-react';
import { Group } from '../types';

interface ParticipantSetupProps {
  onComplete: (groups: Group[], isTeamMode: boolean) => void;
  onBack: () => void;
}

const TELUGU_GROUP_NAMES = [
  "Mega Fans", "Power Stars", "Rebel Army", "Rowdy Boys", 
  "Classy Queens", "Mass Maharajas", "Yuva Samrats", 
  "Natural Stars", "Icon Stars", "Victory Batch", 
  "Lion Kings", "Super Stars", "Konaseema Cobras", 
  "Hyderabad Nawabs", "Amaravati Avengers", "Rayalaseema Roar"
];

export const ParticipantSetup: React.FC<ParticipantSetupProps> = ({ onComplete, onBack }) => {
  // Local State
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTeamMode, setIsTeamMode] = useState(true);
  
  const [generatedGroups, setGeneratedGroups] = useState<Group[]>([]);
  const [view, setView] = useState<'INPUT' | 'GROUPS'>('INPUT');
  
  const [draggedMember, setDraggedMember] = useState<{ name: string, fromGroup: string } | null>(null);
  const [desiredNumGroups, setDesiredNumGroups] = useState(2);

  const handleAddParticipant = () => {
    if (inputValue.trim()) {
      setParticipants([...participants, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    const newPs = [...participants];
    newPs.splice(index, 1);
    setParticipants(newPs);
  };

  const getRandomGroupName = (usedNames: string[]) => {
    const available = TELUGU_GROUP_NAMES.filter(n => !usedNames.includes(n));
    if (available.length === 0) return `Team ${Math.floor(Math.random() * 100)}`;
    return available[Math.floor(Math.random() * available.length)];
  };

  const generateGroups = () => {
    if (participants.length === 0) return;

    if (!isTeamMode) {
      // Individual Mode
      const individualGroups: Group[] = participants.map((p, i) => ({
        id: `player-${i}-${Date.now()}`,
        name: p,
        members: [p],
        score: 0
      }));
      setGeneratedGroups(individualGroups);
      setView('GROUPS');
      return;
    }

    // Team Mode
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const usedNames: string[] = [];
    
    const newGroups: Group[] = Array.from({ length: desiredNumGroups }, (_, i) => {
      const name = getRandomGroupName(usedNames);
      usedNames.push(name);
      return {
        id: `group-${i + 1}-${Date.now()}`,
        name: name,
        members: [],
        score: 0
      };
    });

    shuffled.forEach((person, index) => {
      const groupIndex = index % desiredNumGroups;
      newGroups[groupIndex].members.push(person);
    });

    setGeneratedGroups(newGroups);
    setView('GROUPS');
  };

  // Drag and Drop Logic
  const handleDrop = (targetGroupId: string) => {
    if (!draggedMember) return;
    if (draggedMember.fromGroup === targetGroupId) return;

    const newGroups = generatedGroups.map(g => ({ ...g, members: [...g.members] }));
    const sourceGroup = newGroups.find(g => g.id === draggedMember.fromGroup);
    const targetGroup = newGroups.find(g => g.id === targetGroupId);

    if (sourceGroup && targetGroup) {
      sourceGroup.members = sourceGroup.members.filter(m => m !== draggedMember.name);
      targetGroup.members.push(draggedMember.name);
    }

    setGeneratedGroups(newGroups);
    setDraggedMember(null);
  };

  const handleRemoveFromGroup = (groupId: string, memberName: string) => {
    const newGroups = generatedGroups.map(g => {
        if (g.id === groupId) {
            return { ...g, members: g.members.filter(m => m !== memberName) };
        }
        return g;
    });
    setGeneratedGroups(newGroups);
  };

  const regenerateNames = () => {
    const usedNames: string[] = [];
    const newGroups = generatedGroups.map(g => {
      const newName = getRandomGroupName(usedNames);
      usedNames.push(newName);
      return { ...g, name: newName };
    });
    setGeneratedGroups(newGroups);
  };

  const handleGroupNameChange = (groupId: string, newName: string) => {
    const newGroups = generatedGroups.map(g => {
        if (g.id === groupId) {
            return { ...g, name: newName };
        }
        return g;
    });
    setGeneratedGroups(newGroups);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-cinema-800/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-cinema-700 shadow-2xl animate-fade-in select-none relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        title="Back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="text-center mb-8 pb-6 border-b border-cinema-700 mt-4">
          <h2 className="text-3xl font-bold text-white mb-2">Setup Participants</h2>
          <p className="text-slate-400">Add players and organize teams for the game.</p>
      </div>

      {view === 'INPUT' && (
        <div className="space-y-8 animate-fade-in">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <button 
              onClick={() => setIsTeamMode(!isTeamMode)}
              className="flex items-center gap-3 bg-cinema-900 p-2 rounded-full border border-cinema-700 transition-all hover:border-cinema-accent"
            >
              <span className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isTeamMode ? 'bg-cinema-accent text-white shadow-lg' : 'text-slate-400'}`}>
                Team Play
              </span>
              <span className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isTeamMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>
                Individual
              </span>
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
              placeholder="Enter participant name..."
              className="flex-grow p-4 rounded-2xl bg-cinema-900 border border-cinema-700 text-white focus:border-cinema-accent outline-none transition-all focus:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            />
            <button
              onClick={handleAddParticipant}
              className="p-4 bg-cinema-accent hover:bg-cinema-pop rounded-2xl text-white transition-colors shadow-lg"
            >
              <UserPlus className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-cinema-900/50 rounded-2xl p-6 min-h-[150px] border border-cinema-700/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Participants ({participants.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {participants.map((p, idx) => (
                <div key={idx} className="bg-cinema-800 text-white px-4 py-1.5 rounded-full border border-cinema-700 flex items-center gap-2 animate-fade-in shadow-sm">
                  <span className="font-medium">{p}</span>
                  <button onClick={() => handleRemoveParticipant(idx)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {participants.length === 0 && <span className="text-slate-600 italic">No participants added yet...</span>}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-cinema-900/80 p-6 rounded-2xl border border-cinema-700">
            {isTeamMode ? (
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">Create</span>
                <div className="flex items-center gap-2 bg-cinema-800 rounded-lg p-1.5 border border-cinema-700">
                    <button onClick={() => setDesiredNumGroups(Math.max(2, desiredNumGroups - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-cinema-700 rounded text-white font-bold">-</button>
                    <span className="w-8 text-center text-cinema-pop font-bold text-lg">{desiredNumGroups}</span>
                    <button onClick={() => setDesiredNumGroups(Math.min(10, desiredNumGroups + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-cinema-700 rounded text-white font-bold">+</button>
                </div>
                <span className="text-white font-bold">Teams</span>
              </div>
            ) : (
                <span className="text-emerald-400 font-bold text-sm bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-900/50">Every player will score individually</span>
            )}

            <button
              onClick={generateGroups}
              disabled={participants.length < (isTeamMode ? 2 : 1)}
              className="px-8 py-3 bg-white text-cinema-900 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-105"
            >
              <Shuffle className="w-5 h-5" />
              {isTeamMode ? 'Generate Teams' : 'Ready to Play'}
            </button>
          </div>
        </div>
      )}

      {view === 'GROUPS' && (
        <div className="space-y-6 animate-fade-in">
          {isTeamMode && (
            <div className="flex justify-end">
                <button onClick={regenerateNames} className="text-xs flex items-center gap-1 text-cinema-accent hover:text-white bg-cinema-900 px-3 py-1 rounded-full border border-cinema-700 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Reroll Team Names
                </button>
            </div>
          )}
          
          <div className={`grid grid-cols-1 ${isTeamMode ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'} gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1`}>
            {generatedGroups.map((group) => (
              <div 
                key={group.id} 
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(group.id);
                }}
                className={`bg-cinema-900 rounded-2xl p-4 border border-cinema-700 transition-all ${draggedMember && draggedMember.fromGroup !== group.id ? 'hover:bg-cinema-800 hover:border-cinema-accent border-dashed scale-[1.02]' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                    <input 
                        type="text"
                        value={group.name}
                        onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                        className="flex-grow bg-transparent border-b border-cinema-700 focus:border-cinema-pop outline-none text-cinema-pop font-bold text-lg pb-1"
                    />
                    <Edit2 className="w-3 h-3 text-slate-600" />
                </div>
                
                <div className="space-y-2 min-h-[50px]">
                  {group.members.map((member, mIdx) => (
                    <div 
                      key={mIdx} 
                      draggable={isTeamMode}
                      onDragStart={(e) => {
                          setDraggedMember({ name: member, fromGroup: group.id });
                          e.dataTransfer.effectAllowed = "move";
                      }}
                      className={`flex items-center justify-between bg-cinema-800 p-2.5 rounded-xl text-sm border border-cinema-700 ${isTeamMode ? 'cursor-grab active:cursor-grabbing hover:border-cinema-500 hover:bg-cinema-700' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                          {isTeamMode ? <GripVertical className="w-4 h-4 text-slate-600" /> : <User className="w-4 h-4 text-emerald-500" />}
                          <span className="font-medium text-slate-200">{member}</span>
                      </div>
                      {isTeamMode && (
                        <button onClick={() => handleRemoveFromGroup(group.id, member)} className="text-slate-600 hover:text-red-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {group.members.length === 0 && <p className="text-xs text-slate-600 italic py-4 text-center border border-dashed border-cinema-800 rounded-xl">Drop members here</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6 border-t border-cinema-700">
              <button 
                onClick={() => setView('INPUT')}
                className="px-8 py-4 bg-cinema-800 text-white font-bold rounded-2xl hover:bg-cinema-700 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => onComplete(generatedGroups, isTeamMode)}
                className="flex-grow px-8 py-4 bg-gradient-to-r from-cinema-pop to-orange-600 text-white font-bold rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl"
              >
                Start Game
                <ArrowRight className="w-5 h-5" />
              </button>
          </div>
        </div>
      )}

    </div>
  );
};
