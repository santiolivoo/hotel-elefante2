'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  Search, 
  Eye, 
  Send,
  Mail,
  Phone,
  Clock,
  User,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const statusConfig = {
  'RECEIVED': {
    label: 'Recibido',
    variant: 'secondary',
    color: 'bg-blue-100 text-blue-800'
  },
  'IN_PROGRESS': {
    label: 'En Proceso',
    variant: 'warning',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'RESOLVED': {
    label: 'Resuelto',
    variant: 'success',
    color: 'bg-green-100 text-green-800'
  },
  'CLOSED': {
    label: 'Cerrado',
    variant: 'outline',
    color: 'bg-gray-100 text-gray-800'
  }
}

const subjectIcons = {
  'reserva': '📅',
  'servicios': '🏨',
  'eventos': '🎉',
  'tours': '🏔️',
  'quejas': '⚠️',
  'otros': '💬'
}

export default function OperadorMensajesPage() {
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [filters, setFilters] = useState({
    search: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [messages, filters])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los mensajes',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...messages]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchLower) ||
        message.email.toLowerCase().includes(searchLower) ||
        message.subject.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower)
      )
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredMessages(filtered)
  }

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Estado actualizado',
          description: 'El estado del mensaje ha sido actualizado',
        })
        fetchMessages()
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setIsSendingReply(true)

    try {
      const response = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: selectedMessage.id,
          body: replyText
        }),
      })

      if (response.ok) {
        toast({
          title: 'Respuesta enviada',
          description: 'Tu respuesta ha sido enviada exitosamente',
        })
        setReplyText('')
        fetchMessages()
        // Update status to IN_PROGRESS if it was RECEIVED
        if (selectedMessage.status === 'RECEIVED') {
          updateMessageStatus(selectedMessage.id, 'IN_PROGRESS')
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo enviar la respuesta',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const getStats = () => {
    return {
      total: messages.length,
      received: messages.filter(m => m.status === 'RECEIVED').length,
      inProgress: messages.filter(m => m.status === 'IN_PROGRESS').length,
      resolved: messages.filter(m => m.status === 'RESOLVED').length
    }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Mensajes</h1>
        <p className="text-gray-600">Administra los mensajes de contacto de los clientes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.received}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o mensaje..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Mensajes ({filteredMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {message.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {message.email}
                        </div>
                        {message.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {message.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{subjectIcons[message.subject] || '💬'}</span>
                        <span className="capitalize">{message.subject.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={message.message}>
                        {message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(message.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={message.status} 
                        onValueChange={(value) => updateMessageStatus(message.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <Badge variant={statusConfig[message.status].variant} className="w-full justify-center">
                            {statusConfig[message.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEIVED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <span>Recibido</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                              <span>En Proceso</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="RESOLVED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span>Resuelto</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="CLOSED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                              <span>Cerrado</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Mensaje</DialogTitle>
                            </DialogHeader>
                            {selectedMessage && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Información del Cliente</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-500" />
                                        {selectedMessage.name}
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                        {selectedMessage.email}
                                      </div>
                                      {selectedMessage.phone && (
                                        <div className="flex items-center">
                                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                          {selectedMessage.phone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Detalles del Mensaje</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>
                                        <span className="font-medium">Asunto:</span> {selectedMessage.subject}
                                      </div>
                                      <div>
                                        <span className="font-medium">Fecha:</span> {formatDateTime(selectedMessage.createdAt)}
                                      </div>
                                      <div>
                                        <span className="font-medium">Estado:</span>
                                        <Badge variant={statusConfig[selectedMessage.status].variant} className="ml-2">
                                          {statusConfig[selectedMessage.status].label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Mensaje</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    {selectedMessage.message}
                                  </div>
                                </div>

                                {/* Replies */}
                                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Respuestas</h4>
                                    <div className="space-y-2">
                                      {selectedMessage.replies.map((reply) => (
                                        <div key={reply.id} className="bg-blue-50 p-3 rounded-lg">
                                          <div className="text-sm text-gray-600 mb-1">
                                            {formatDateTime(reply.sentAt)}
                                          </div>
                                          <div className="text-sm">{reply.body}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Reply Form */}
                                <div>
                                  <h4 className="font-semibold mb-2">Enviar Respuesta</h4>
                                  <div className="space-y-2">
                                    <Textarea
                                      placeholder="Escribe tu respuesta..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      rows={4}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={sendReply}
                                        disabled={!replyText.trim() || isSendingReply}
                                      >
                                        {isSendingReply ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                          </>
                                        ) : (
                                          <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Respuesta
                                          </>
                                        )}
                                      </Button>
                                      
                                      {selectedMessage.status !== 'RESOLVED' && (
                                        <Button
                                          variant="outline"
                                          onClick={() => updateMessageStatus(selectedMessage.id, 'RESOLVED')}
                                        >
                                          Marcar como Resuelto
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron mensajes
              </h3>
              <p className="text-gray-600">
                No hay mensajes que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
