import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('[PATCH] Params recibidos:', resolvedParams)
    console.log('[PATCH] ID recibido:', id, 'Tipo:', typeof id)

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    const { name, email, role, password } = await request.json()

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el email, verificar que no esté en uso
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 409 }
        )
      }
    }

    // Validar rol si se proporciona
    if (role && !['USER', 'OPERATOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Preparar datos de actualización
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    
    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      const bcrypt = require('bcryptjs')
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('[DELETE] Params recibidos:', resolvedParams)
    console.log('[DELETE] ID recibido:', id, 'Tipo:', typeof id)

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar el propio usuario
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 403 }
      )
    }

    // Verificar si el usuario tiene reservas activas
    const activeReservations = await prisma.reservation.findMany({
      where: {
        userId: id,
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED']
        }
      }
    })

    if (activeReservations.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un usuario con reservas activas' },
        { status: 409 }
      )
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
