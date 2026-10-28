import express from 'express'
import { createProject, deleteProject, getAllProject, getProjectById, getProjectByLiked, toggleLike } from '../controllers/project.controller.js';

const projectRouter = express.Router();

projectRouter.get('/', getAllProject);
projectRouter.get('/project/:id', getProjectById);
projectRouter.get('/likedProject', getProjectByLiked);

projectRouter.patch('/like/:id', toggleLike);
projectRouter.post('/createProject', createProject);

projectRouter.delete('/deleteProject/:id', deleteProject)


export default projectRouter;