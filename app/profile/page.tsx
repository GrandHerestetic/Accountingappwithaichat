"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  MapPin,
  CheckCircle,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Edit,
  Save,
  X,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AdminProfilePanel } from "@/components/profile/admin-profile-panel"
import { useAuth } from "@/contexts/auth-context"
import { getExecutorRating, getExecutorReviews, getProfile, updateProfile, uploadProfileAvatar } from "@/lib/api"
import { FileUploadField } from "@/components/file-upload-field"
import { ProfileAchievementsTab } from "@/components/profile/profile-achievements-tab"
import { ProfilePortfolioTab } from "@/components/profile/profile-portfolio-tab"
import { MyReviewsPanel } from "@/components/reviews/my-reviews-panel"
import { resolveUploadUrl } from "@/lib/upload-url"
import {
  filterProfileDocuments,
  parseProfileDocuments,
  PROFILE_DOC_KIND_ACHIEVEMENT,
  PROFILE_DOC_KIND_PORTFOLIO,
  type ProfileDocItem,
} from "@/lib/profile-documents"
import type { ProfilePlatformAchievement, Review } from "@/lib/api/types"
import { FormField, fieldAriaProps, fieldInputClass } from "@/components/form-field"
import {
  clearFieldError,
  type FieldErrors,
  validateMinLength,
  validatePhone,
  validateUrl,
} from "@/lib/form-errors"
import { toast } from "sonner"
import {
  getProfileSpecializationsForDisplay,
  getProfileTitle,
  parseProfileSpecializations,
} from "@/lib/profile-display"

type ProfileField = "name" | "phone" | "website"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    title: "",
    location: "",
    bio: "",
    email: "",
    phone: "",
    website: "",
  })
  const [specializations, setSpecializations] = useState<string[]>([])
  const [specializationsText, setSpecializationsText] = useState("")
  const [profileDocuments, setProfileDocuments] = useState<ProfileDocItem[]>([])
  const [platformAchievements, setPlatformAchievements] = useState<ProfilePlatformAchievement[]>([])
  const [profileErrors, setProfileErrors] = useState<FieldErrors<ProfileField>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("")

  const applyProfileFromApi = (p: Record<string, unknown>) => {
    const rawSpecs = parseProfileSpecializations(p.specializations)
    const displaySpecs = rawSpecs.length > 0 ? rawSpecs : getProfileSpecializationsForDisplay(p, user?.role)
    setEditedProfile({
      name: String(p.profile_name ?? p.display_name ?? p.contact_name ?? p.company_name ?? ""),
      title: getProfileTitle(p) || String(p.experience_level ?? p.expertise ?? ""),
      location: String(p.city ?? p.address ?? ""),
      bio: String(p.about ?? p.bio ?? ""),
      email: user?.email ?? "",
      phone: String(p.phone ?? ""),
      website: String(p.website ?? ""),
    })
    setSpecializations(displaySpecs)
    setSpecializationsText(displaySpecs.join(", "))
  }

  const profile = {
    name: editedProfile.name || user?.profile?.profile_name || user?.email || "",
    title:
      editedProfile.title ||
      specializations[0] ||
      getProfileTitle((user?.profile as Record<string, unknown> | undefined) ?? {}) ||
      "Специалист",
    location: editedProfile.location || "",
    rating: rating || 0,
    reviewsCount: reviews.length,
    completedOrders: 0,
    memberSince:
      (user?.profile?.platform_joined_at as string | undefined) ?? user?.created_at ?? "",
    verified: user?.verification_status === "verified",
    avatar:
      avatarPreviewUrl ||
      resolveUploadUrl(user?.profile?.avatar_url) ||
      "/placeholder.svg?height=120&width=120",
    bio: editedProfile.bio,
    specializations,
    contact: {
      email: editedProfile.email || user?.email || "",
      phone: editedProfile.phone,
      website: editedProfile.website,
    },
  }

  const reloadProfileDocuments = async () => {
    const p = await getProfile()
    setProfileDocuments(parseProfileDocuments(p.documents))
    const achievements = p.achievements
    if (Array.isArray(achievements)) {
      setPlatformAchievements(
        achievements.map((a) => {
          const row = a as Record<string, unknown>
          return {
            code: String(row.code ?? ""),
            title: String(row.title ?? ""),
            description: String(row.description ?? ""),
          }
        })
      )
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const p = await getProfile()
        applyProfileFromApi(p as Record<string, unknown>)
        setProfileDocuments(parseProfileDocuments(p.documents))
        const achievements = p.achievements
        if (Array.isArray(achievements)) {
          setPlatformAchievements(
            achievements.map((a) => {
              const row = a as Record<string, unknown>
              return {
                code: String(row.code ?? ""),
                title: String(row.title ?? ""),
                description: String(row.description ?? ""),
              }
            })
          )
        }
        if (user?.id && user.role === "executor") {
          const [r, rev] = await Promise.all([
            getExecutorRating(user.id),
            getExecutorReviews(user.id, { page: 1, pageSize: 20 }),
          ])
          setRating(r.avg_rating_total)
          setReviews(rev.items)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  const handleAvatarSave = async () => {
    if (!avatarFile) return
    setAvatarSaving(true)
    try {
      const updated = await uploadProfileAvatar(avatarFile)
      const url = resolveUploadUrl(String(updated.avatar_url ?? ""))
      if (url) setAvatarPreviewUrl(url)
      await refreshUser()
      setAvatarFile(null)
      toast.success("Аватар обновлён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить аватар")
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    const nextErrors: FieldErrors<ProfileField> = {
      name: validateMinLength(editedProfile.name, 2, "Укажите имя"),
      phone: validatePhone(editedProfile.phone),
      website: validateUrl(editedProfile.website),
    }
    setProfileErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    try {
      const specsText = specializationsText.trim() || editedProfile.title.trim()
      const primarySpec = specsText.split(/[,;]+/)[0]?.trim() || undefined
      const updated = await updateProfile(
        {
          profile_name: editedProfile.name.trim(),
          phone: editedProfile.phone.trim(),
          about: editedProfile.bio.trim(),
          bio: editedProfile.bio.trim(),
          location: editedProfile.location.trim(),
          website: editedProfile.website.trim(),
          ...(user?.role === "coach"
            ? { expertise: specsText || undefined }
            : user?.role === "executor"
              ? {
                  experience_level: primarySpec,
                  specializations_text: specsText,
                }
              : { experience_level: editedProfile.title.trim() || undefined }),
          ...(user?.role === "client"
            ? {
                company_name: editedProfile.name.trim(),
                contact_name: editedProfile.name.trim(),
              }
            : {}),
        },
        user?.role
      )
      applyProfileFromApi(updated as Record<string, unknown>)
      await refreshUser()
      toast.success("Профиль обновлён")
      setProfileErrors({})
      setIsEditDialogOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (field === "name" || field === "phone" || field === "website") {
      setProfileErrors((prev) => clearFieldError(prev, field))
    }
  }

  if (user?.role === "admin") {
    return <AdminProfilePanel />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">МА</AvatarFallback>
                      </Avatar>
                      {profile.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                    <p className="text-gray-600 mb-3">{profile.title}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-bold">{profile.rating}</span>
                      <span className="text-gray-600">({profile.reviewsCount} отзывов)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Завершено заказов:</span>
                      <span className="font-medium">{profile.completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">На платформе с:</span>
                      <span className="font-medium">
                        {profile.memberSince &&
                        !Number.isNaN(new Date(profile.memberSince).getTime())
                          ? new Date(profile.memberSince).toLocaleDateString("ru-RU", {
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <Button className="w-full" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать профиль
                      </Button>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Редактирование профиля</DialogTitle>
                          <DialogDescription>
                            Обновите информацию о себе, чтобы привлечь больше клиентов
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-lg">Фото профиля</h4>
                            <FileUploadField
                              label="Загрузить аватар"
                              hint="JPG, PNG, WEBP до 5 МБ"
                              value={avatarFile}
                              onChange={setAvatarFile}
                              accept="image/jpeg,image/png,image/webp"
                              disabled={avatarSaving}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!avatarFile || avatarSaving}
                              onClick={handleAvatarSave}
                            >
                              {avatarSaving ? "Загрузка..." : "Сохранить аватар"}
                            </Button>
                          </div>
                          {/* Основная информация */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-lg">Основная информация</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField label="Имя и фамилия" htmlFor="edit-name" error={profileErrors.name} required>
                                <Input
                                  id="edit-name"
                                  value={editedProfile.name}
                                  onChange={(e) => handleInputChange("name", e.target.value)}
                                  className={fieldInputClass(profileErrors.name)}
                                  {...fieldAriaProps(profileErrors.name, "edit-name")}
                                />
                              </FormField>
                              {user?.role !== "executor" && user?.role !== "coach" && (
                                <FormField label="Специализация" htmlFor="edit-title">
                                  <Input
                                    id="edit-title"
                                    value={editedProfile.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="Например: Налоговый учёт"
                                  />
                                </FormField>
                              )}
                            </div>
                            {(user?.role === "executor" || user?.role === "coach") && (
                              <FormField
                                label="Специализации (через запятую)"
                                htmlFor="edit-specializations"
                              >
                                <Input
                                  id="edit-specializations"
                                  value={specializationsText}
                                  onChange={(e) => setSpecializationsText(e.target.value)}
                                  placeholder="Налоги, 1С, Отчётность"
                                />
                              </FormField>
                            )}
                            <FormField label="Местоположение" htmlFor="edit-location">
                              <Input
                                id="edit-location"
                                value={editedProfile.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                              />
                            </FormField>
                            <FormField label="О себе" htmlFor="edit-bio">
                              <Textarea
                                id="edit-bio"
                                rows={4}
                                value={editedProfile.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                placeholder="Расскажите о своем опыте и специализации..."
                              />
                            </FormField>
                          </div>

                          {/* Контактная информация */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-lg">Контактная информация</h4>
                            <div className="space-y-4">
                              <FormField label="Email" htmlFor="edit-email">
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editedProfile.email}
                                  disabled
                                />
                              </FormField>
                              <FormField label="Телефон" htmlFor="edit-phone" error={profileErrors.phone}>
                                <Input
                                  id="edit-phone"
                                  value={editedProfile.phone}
                                  onChange={(e) => handleInputChange("phone", e.target.value)}
                                  className={fieldInputClass(profileErrors.phone)}
                                  {...fieldAriaProps(profileErrors.phone, "edit-phone")}
                                />
                              </FormField>
                              <FormField label="Веб-сайт" htmlFor="edit-website" error={profileErrors.website}>
                                <Input
                                  id="edit-website"
                                  value={editedProfile.website}
                                  onChange={(e) => handleInputChange("website", e.target.value)}
                                  placeholder="https://your-website.com"
                                  className={fieldInputClass(profileErrors.website)}
                                  {...fieldAriaProps(profileErrors.website, "edit-website")}
                                />
                              </FormField>
                            </div>
                          </div>

                          {/* Кнопки действий */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button onClick={handleSaveProfile} className="flex-1">
                              <Save className="w-4 h-4 mr-2" />
                              Сохранить изменения
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              <X className="w-4 h-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/chat" aria-label="Перейти в чаты">
                          <MessageCircle className="w-4 h-4" />
                        </Link>
                      </Button>
                      {profile.contact.phone ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${profile.contact.phone}`} aria-label="Позвонить">
                            <Phone className="w-4 h-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label="Позвонить"
                          onClick={() => toast.info("Укажите телефон в профиле")}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      {profile.contact.email ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${profile.contact.email}`} aria-label="Написать на email">
                            <Mail className="w-4 h-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled aria-label="Email не указан">
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={profile.contact.website} className="text-sm text-blue-600 hover:underline">
                      {profile.contact.website}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">О себе</TabsTrigger>
                  <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                  <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
                  <TabsTrigger value="achievements">Достижения</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Описание</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Специализации</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.specializations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Укажите специализацию в настройках профиля
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  {user?.role === "executor" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Отзывы обо мне</CardTitle>
                        <CardDescription>
                          {profile.reviewsCount} отзывов · средняя оценка {profile.rating.toFixed(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {reviews.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-6">
                            Пока нет отзывов от клиентов
                          </p>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">
                                    Заказ #{review.order_id.slice(0, 8)}
                                  </h4>
                                  <p className="text-sm text-gray-600">Отзыв клиента</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? "text-yellow-500 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {review.created_at
                                      ? new Date(review.created_at).toLocaleDateString("ru-RU")
                                      : ""}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-700">{review.comment ?? ""}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}
                  <MyReviewsPanel userRole={user?.role} />
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-6">
                  {user?.id ? (
                    <ProfilePortfolioTab
                      userId={user.id}
                      items={filterProfileDocuments(profileDocuments, PROFILE_DOC_KIND_PORTFOLIO)}
                      onChanged={reloadProfileDocuments}
                    />
                  ) : null}
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  {user?.id ? (
                    <ProfileAchievementsTab
                      userId={user.id}
                      items={filterProfileDocuments(profileDocuments, PROFILE_DOC_KIND_ACHIEVEMENT)}
                      platformAchievements={platformAchievements}
                      onChanged={reloadProfileDocuments}
                    />
                  ) : null}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
