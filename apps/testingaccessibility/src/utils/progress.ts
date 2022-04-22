import {SanityDocument} from '@sanity/client'
import {createClient} from '@supabase/supabase-js'
import axios from 'axios'

const SUPABASE_URL = `https://${process.env.PROGRESS_DATABASE_ID}.supabase.co`
const SUPABASE_KEY = process.env.SUPABASE_KEY
export const supabase = SUPABASE_KEY && createClient(SUPABASE_URL, SUPABASE_KEY)
export const progressTable = process.env.PROGRESS_TABLE_NAME || 'users_dev'

type ProgressProps = {
  slug: string
}

export const setProgressForUser = async ({slug}: ProgressProps) =>
  await axios
    .post(`/api/progress/lessons/${slug}`)
    .catch(() => {
      throw new Error('failed to set progress')
    })
    .then(({data}) => {
      console.debug('progress set! ✔️')
      return data
    })

export const getProgressForUser = async () =>
  await axios
    .get(`/api/progress`)
    .catch(() => {
      throw new Error('failed to get progress')
    })
    .then(({data}) => {
      console.debug('progress loaded! ✔️', data)
      return data
    })

export const getProgressForSection = (
  completedLessons: string[],
  sectionLessons: SanityDocument[],
) => {
  if (!completedLessons || !sectionLessons) {
    return {}
  }
  const sectionLessonsSlugs: string[] = sectionLessons.map(({slug}) => slug)
  const completedLessonsInSection = completedLessons.filter((lesson) =>
    sectionLessonsSlugs.includes(lesson),
  )
  const isSectionCompleted =
    sectionLessons.length === completedLessonsInSection.length

  return {
    completedLessons: completedLessonsInSection,
    isSectionCompleted,
  }
}

export const getProgressForModule = (
  completedLessons: string[],
  moduleSections: SanityDocument[],
) => {
  if (!completedLessons || !moduleSections) {
    return {}
  }

  let completedSectionsInModule: string[] = []

  moduleSections.forEach((section) => {
    const {isSectionCompleted} = getProgressForSection(
      completedLessons,
      section.lessons,
    )
    if (isSectionCompleted) {
      return completedSectionsInModule.push(section.slug)
    }
  })

  const isModuleCompleted =
    moduleSections.length === completedSectionsInModule.length

  return {
    completedSections: completedSectionsInModule,
    isModuleCompleted,
  }
}
