import { Router } from 'express';
import { topicController } from '../controllers/topicController';

const router = Router();

// GET /api/topics (support search, category, difficulty)
router.get('/', topicController.getTopics.bind(topicController));

// GET /api/topics/category/:category
router.get('/category/:category', topicController.getTopicsByCategory.bind(topicController));

// GET /api/topics/:slug
router.get('/:slug', topicController.getTopicBySlug.bind(topicController));

export default router;
