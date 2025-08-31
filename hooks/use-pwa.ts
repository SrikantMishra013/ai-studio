import { useState, useEffect, useCallback } from 'react'

interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  hasUpdate: boolean
  isSupported: boolean
}

interface PWAUpdate {
  isAvailable: boolean
  isInstalling: boolean
  install: () => Promise<void>
  skipWaiting: () => void
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasUpdate: false,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
  })

  const [update, setUpdate] = useState<PWAUpdate>({
    isAvailable: false,
    isInstalling: false,
    install: async () => {},
    skipWaiting: () => {},
  })

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true
      
      setStatus(prev => ({ ...prev, isInstalled }))
    }

    checkInstallation()
    window.addEventListener('beforeinstallprompt', checkInstallation)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallation)
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Service Worker registration and update handling
  useEffect(() => {
    if (!status.isSupported) return

    let registration: ServiceWorkerRegistration | null = null

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully:', registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdate(prev => ({ ...prev, isAvailable: true }))
              }
            })
          }
        })

        // Handle controller change (update installed)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setUpdate(prev => ({ ...prev, isAvailable: false }))
          window.location.reload()
        })

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'BACKGROUND_SYNC') {
            console.log('Background sync message:', event.data.message)
          }
        })

      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    registerSW()

    return () => {
      if (registration) {
        registration.unregister()
      }
    }
  }, [status.isSupported])

  // Install prompt handling
  useEffect(() => {
    let deferredPrompt: any = null

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      
      setUpdate(prev => ({
        ...prev,
        install: async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
              setStatus(prev => ({ ...prev, isInstalled: true }))
            }
            deferredPrompt = null
          }
        }
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Skip waiting for service worker update
  const skipWaiting = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [])

  useEffect(() => {
    setUpdate(prev => ({ ...prev, skipWaiting }))
  }, [skipWaiting])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    const hasPermission = await requestNotificationPermission()
    
    if (hasPermission) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('AI Studio', {
        body: 'Notifications are working! 🎉',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification',
      })
    }
  }, [requestNotificationPermission])

  // Check cache status
  const getCacheStatus = useCallback(async () => {
    if (!('caches' in window)) return null

    try {
      const cacheNames = await caches.keys()
      const cacheStatus = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          return { name, size: keys.length }
        })
      )
      return cacheStatus
    } catch (error) {
      console.error('Failed to get cache status:', error)
      return null
    }
  }, [])

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) return

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }, [])

  return {
    status,
    update,
    requestNotificationPermission,
    sendTestNotification,
    getCacheStatus,
    clearAllCaches,
  }
}
