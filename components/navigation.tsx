"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import {
  User,
  FileText,
  Search,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Menu,
  UserPlus,
  LogIn,
  MessageCircle,
  BookOpen,
  Home,
  X,
  Star,
  DollarSign,
  Info,
  BarChart3,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { resolveUploadUrl } from "@/lib/upload-url"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    router.push("/auth/login") // Добавить эту строку
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/orders" && pathname === "/orders") return true
    if (path === "/courses" && pathname === "/courses") return true
    if (path === "/features" && pathname === "/features") return true
    if (path === "/pricing" && pathname === "/pricing") return true
    if (path === "/about" && pathname === "/about") return true
    if (path === "/chat" && pathname === "/chat") return true

    // Client routes
    if (path === "/client/dashboard" && pathname === "/client/dashboard") return true
    if (path === "/client/orders" && (pathname === "/client/dashboard" || pathname.startsWith("/client/order")))
      return true

    // Executor routes
    if (path === "/executor/dashboard" && pathname === "/executor/dashboard") return true
    if (path === "/executor/orders" && pathname === "/executor/orders") return true

    // Coach routes
    if (path === "/coach/dashboard" && pathname === "/coach/dashboard") return true
    if (path === "/coach/courses" && pathname.startsWith("/coach/courses")) return true
    if (path === "/coach/students" && pathname === "/coach/students") return true
    if (path === "/coach/analytics" && pathname === "/coach/analytics") return true

    // Admin routes
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard") return true
    if (path === "/admin/users" && pathname === "/admin/users") return true
    if (path === "/admin/orders" && pathname === "/admin/orders") return true
    if (path === "/admin/disputes" && pathname === "/admin/disputes") return true
    if (path === "/admin/analytics" && pathname === "/admin/analytics") return true
    if (path === "/admin/course-assignments" && pathname === "/admin/course-assignments") return true

    return false
  }

  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        {
          href: "/",
          label: "Главная",
          icon: Home,
          active: isActive("/"),
        },
        {
          href: "/orders",
          label: "Заказы",
          icon: Search,
          active: isActive("/orders"),
        },
        {
          href: "/courses",
          label: "Курсы",
          icon: BookOpen,
          active: isActive("/courses"),
        },
        {
          href: "/features",
          label: "Возможности",
          icon: Star,
          active: isActive("/features"),
        },
        {
          href: "/pricing",
          label: "Тарифы",
          icon: DollarSign,
          active: isActive("/pricing"),
        },
        {
          href: "/about",
          label: "О нас",
          icon: Info,
          active: isActive("/about"),
        },
      ]
    }

    const baseItems = [
      {
        href: "/",
        label: "Главная",
        icon: Home,
        active: isActive("/"),
      },
      {
        href: "/orders",
        label: "Заказы",
        icon: Search,
        active: isActive("/orders"),
      },
      {
        href: "/courses",
        label: "Курсы",
        icon: BookOpen,
        active: isActive("/courses"),
      },
    ]

    switch (user?.role) {
      case "client":
        return [
          ...baseItems,
          {
            href: "/client/dashboard",
            label: "Dashboard",
            icon: User,
            active: isActive("/client/dashboard"),
          },
        ]
      case "executor":
        return [
          ...baseItems,
          {
            href: "/executor/dashboard",
            label: "Dashboard",
            icon: User,
            active: isActive("/executor/dashboard"),
          },
          {
            href: "/executor/orders",
            label: "Поиск работы",
            icon: Search,
            active: isActive("/executor/orders"),
          },
          {
            href: "/executor/responses",
            label: "Мои отклики",
            icon: FileText,
            active: pathname.startsWith("/executor/responses"),
          },
          {
            href: "/executor/courses",
            label: "Мои курсы",
            icon: BookOpen,
            active: pathname.startsWith("/executor/courses"),
          },
        ]
      case "coach":
        return [
          ...baseItems,
          {
            href: "/coach/dashboard",
            label: "Dashboard",
            icon: User,
            active: isActive("/coach/dashboard"),
          },
          {
            href: "/coach/courses",
            label: "Мои курсы",
            icon: BookOpen,
            active: isActive("/coach/courses"),
          },
          {
            href: "/coach/students",
            label: "Студенты",
            icon: Users,
            active: isActive("/coach/students"),
          },
        ]
      case "admin":
        return [
          ...baseItems,
          {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: Settings,
            active: isActive("/admin/dashboard"),
          },
          {
            href: "/admin/users",
            label: "Пользователи",
            icon: User,
            active: isActive("/admin/users"),
          },
          {
            href: "/admin/orders",
            label: "Управление заказами",
            icon: FileText,
            active: isActive("/admin/orders"),
          },
          {
            href: "/admin/course-assignments",
            label: "Назначение курсов",
            icon: BookOpen,
            active: isActive("/admin/course-assignments"),
          },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  // Единый стиль для всех кнопок навигации
  const getButtonClassName = (isActive: boolean) => {
    return `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-2 md:px-4 py-2 ${
      isActive ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo - адаптивный */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Briefcase className="h-3 w-3 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BuhPro
              </span>
            </Link>

            {/* Desktop Navigation - скрываем на мобильных */}
            <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={getButtonClassName(item.active)}>
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Right side - адаптивный */}
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Notifications - заменяем ссылку на выпадающий компонент */}
                  <div className="hidden xs:block">
                    <NotificationsDropdown />
                  </div>

                  {/* Chat - скрываем на очень маленьких экранах */}
                  <Link href="/chat" className="hidden xs:block">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-2">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden lg:inline text-sm">Чат</span>
                    </Button>
                  </Link>

                  {/* User Menu - адаптивный */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-1 md:space-x-2 px-1 md:px-2">
                        <Avatar className="h-6 w-6 md:h-7 md:w-7">
                          <AvatarImage
                            src={
                              resolveUploadUrl(user?.profile?.avatar_url) || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {(user?.profile?.profile_name ?? user?.email ?? "U")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline text-sm font-medium max-w-20 truncate">
                          {user?.profile?.profile_name ?? user?.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 md:w-56">
                      <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Основные пункты меню */}
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Профиль
                        </Link>
                      </DropdownMenuItem>

                      {/* Чат - добавляем для всех типов пользователей */}
                      <DropdownMenuItem asChild>
                        <Link href="/chat">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Чат
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Настройки
                        </Link>
                      </DropdownMenuItem>

                      {/* Специфичные пункты для разных типов пользователей */}
                      {user?.role === "coach" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/coach/analytics">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Аналитика
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {user?.role === "admin" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin/analytics">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Аналитика
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/moderation">
                              <Settings className="mr-2 h-4 w-4" />
                              Модерация
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2 md:px-3">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Войти</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-1 px-2 md:px-3"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm">Регистрация</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 md:w-48">
                      <DropdownMenuLabel className="text-sm">Выберите тип аккаунта</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/client/register">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span className="text-sm">Заказчик</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/executor/register">
                          <User className="mr-2 h-4 w-4" />
                          <span className="text-sm">Исполнитель</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/coach/register">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span className="text-sm">Коуч</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - полноэкранное меню */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-white border-t md:hidden">
          <nav className="flex flex-col p-4 space-y-3 h-full overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`w-full justify-start space-x-3 h-12 text-base ${
                      item.active
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}

            {/* Добавляем Аналитику для коуча в мобильное меню */}
            {isAuthenticated && user?.role === "coach" && (
              <Link href="/coach/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive("/coach/analytics") ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 h-12 text-base ${
                    isActive("/coach/analytics")
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Аналитика</span>
                </Button>
              </Link>
            )}

            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200 my-3" />
                <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base">
                    <MessageCircle className="h-5 w-5" />
                    <span>Чат</span>
                  </Button>
                </Link>
                <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base">
                    <Bell className="h-5 w-5" />
                    <span>Уведомления</span>
                  </Button>
                </Link>
                <div className="border-t border-gray-200 my-3" />
                <Button
                  variant="ghost"
                  className="w-full justify-start space-x-3 h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Выйти</span>
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="border-t border-gray-200 my-3" />
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base">
                    <LogIn className="h-5 w-5" />
                    <span>Войти</span>
                  </Button>
                </Link>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 px-3 py-2">Регистрация:</p>
                  <Link href="/client/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base pl-6">
                      <Briefcase className="h-5 w-5" />
                      <span>Заказчик</span>
                    </Button>
                  </Link>
                  <Link href="/executor/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base pl-6">
                      <User className="h-5 w-5" />
                      <span>Исполнитель</span>
                    </Button>
                  </Link>
                  <Link href="/coach/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start space-x-3 h-12 text-base pl-6">
                      <BookOpen className="h-5 w-5" />
                      <span>Коуч</span>
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
