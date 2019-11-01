'use strict'

const Task = use('App/Models/Task')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class TaskController {
  async index ({ params }) {
    const tasks = await Task.query()
      .where('project_id', params.projects_id)
      .with('user')
      .fetch()

    return tasks
  }

  async store ({ request, params }) {
    const data = request.only([
      'user_id',
      'title',
      'description',
      'due_data',
      'file_id'
    ])

    const task = Task.create({ ...data, project_id: params.projects_id })

    return task
  }

  async show ({ params, request }) {
    const task = await Task.findOrFail(params.id)

    return task
  }

  async update ({ params, request, response }) {
    const task = await Task.findOrFail(params.id)
    const data = request.only([
      'user_id',
      'title',
      'description',
      'due_data',
      'file_id'
    ])

    task.merge(data)

    await task.save()

    return task
  }

  async destroy ({ params }) {
    const task = await Task.findOrFail(params.id)

    await task.delete()
  }
}

module.exports = TaskController
