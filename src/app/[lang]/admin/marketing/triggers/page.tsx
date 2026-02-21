"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { TriggerConditionType, TriggerChannel } from "@prisma/client"
import { toast } from "sonner"
import { Plus, Play, Pause, Trash } from "lucide-react"

export default function TriggersPage() {
    const [triggers, setTriggers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    // New Trigger Form State
    const [newTrigger, setNewTrigger] = useState({
        name: "",
        conditionType: "REGISTERED_NO_PURCHASE",
        delayMinutes: 0,
        messageText: "",
        channel: "TELEGRAM" as TriggerChannel
    })

    useEffect(() => {
        loadTriggers()
    }, [])

    const loadTriggers = async () => {
        try {
            const res = await fetch('/api/admin/marketing/triggers')
            if (res.ok) {
                const data = await res.json()
                setTriggers(data)
            }
        } catch (error) {
            toast.error("Failed to load triggers")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/marketing/triggers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTrigger,
                    messageTemplate: { text: newTrigger.messageText, buttons: [] },
                    isActive: true
                })
            })

            if (res.ok) {
                toast.success("Trigger created")
                setIsCreating(false)
                loadTriggers()
            } else {
                toast.error("Failed to create")
            }
        } catch (error) {
            toast.error("Error creating trigger")
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        // Implementation for toggle status API call
        toast.info("Status toggle not implemented in this demo")
    }

    return (
        <AdminLayout title="Automation Triggers">
            <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-bold">Active Rules</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" /> New Trigger
                </Button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Define New Rule</h3>
                    <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
                        <Input
                            placeholder="Trigger Name (e.g. Abandoned Cart)"
                            value={newTrigger.name}
                            onChange={e => setNewTrigger({ ...newTrigger, name: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                className="p-3 border rounded-lg"
                                value={newTrigger.conditionType}
                                onChange={e => setNewTrigger({ ...newTrigger, conditionType: e.target.value })}
                            >
                                {Object.values(TriggerConditionType).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <Input
                                type="number"
                                placeholder="Delay (minutes)"
                                value={newTrigger.delayMinutes}
                                onChange={e => setNewTrigger({ ...newTrigger, delayMinutes: parseInt(e.target.value) })}
                            />
                        </div>
                        <textarea
                            className="w-full p-3 border rounded-lg h-32"
                            placeholder="Message Text (supports {user_name})"
                            value={newTrigger.messageText}
                            onChange={e => setNewTrigger({ ...newTrigger, messageText: e.target.value })}
                            required
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button type="submit">Save Rule</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {triggers.map(trigger => (
                    <div key={trigger.id} className="bg-white p-6 rounded-xl border flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg">{trigger.name}</h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${trigger.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {trigger.isActive ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                If <strong>{trigger.conditionType}</strong> then wait <strong>{trigger.delayMinutes}m</strong> → Send {trigger.channel}
                            </p>
                            <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                "{trigger.messageTemplate?.text}"
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleStatus(trigger.id, trigger.isActive)}>
                                {trigger.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {triggers.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-400">No active triggers found.</div>
                )}
            </div>
        </AdminLayout>
    )
}
