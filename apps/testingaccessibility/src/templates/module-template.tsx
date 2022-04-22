import React from 'react'
import {SanityDocument} from '@sanity/client'
import Layout from 'components/app/layout'
import Link from 'next/link'
import {useProgress} from 'context/progress-context'
import {getProgressForModule, getProgressForSection} from 'utils/progress'

type ModuleTemplateProps = {
  module: SanityDocument
}

const ModuleTemplate: React.FC<ModuleTemplateProps> = ({module}) => {
  const {slug, title, body, sections} = module
  const {completedLessons} = useProgress()
  const {completedSections, isModuleCompleted} = getProgressForModule(
    completedLessons,
    sections,
  )

  return (
    <Layout>
      <div className="container">
        <main className="p-10">
          <nav aria-label="breadcrumb">
            <ol className="flex gap-2">
              <li>
                <Link href="/learn">
                  <a className="underline">Learn</a>
                </Link>
              </li>{' '}
              &gt; <li aria-current="page">{title}</li>
            </ol>
          </nav>
          <article>
            <h1 className="text-4xl font-bold pb-5">
              {isModuleCompleted && '✅'} {title}
            </h1>
            sections completed: {completedSections?.length}
            <hr />
            {sections && (
              <ol className="list-decimal px-5">
                {sections.map((section: SanityDocument) => {
                  const {isSectionCompleted} = getProgressForSection(
                    completedLessons,
                    section.lessons,
                  )
                  return (
                    <>
                      <li>
                        <Link
                          href={{
                            pathname: '/learn/[module]/[section]',
                            query: {module: module.slug, section: section.slug},
                          }}
                          passHref
                        >
                          <a className="underline">
                            {isSectionCompleted && '✅'} {section.title}
                          </a>
                        </Link>
                      </li>
                      {section.lessons && (
                        <ol className="list-decimal px-5">
                          {section.lessons.map((lesson: SanityDocument) => {
                            const isCompleted = completedLessons?.includes(
                              lesson.slug,
                            )
                            return (
                              <li>
                                <Link
                                  href={{
                                    pathname:
                                      '/learn/[module]/[section]/[lesson]',
                                    query: {
                                      module: module.slug,
                                      section: section.slug,
                                      lesson: lesson.slug,
                                    },
                                  }}
                                  passHref
                                >
                                  <a className="underline">
                                    {isCompleted && '✅'} {lesson.title}
                                  </a>
                                </Link>
                              </li>
                            )
                          })}
                        </ol>
                      )}
                    </>
                  )
                })}
              </ol>
            )}
          </article>
        </main>
      </div>
    </Layout>
  )
}

export default ModuleTemplate
