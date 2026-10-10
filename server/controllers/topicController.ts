import { Request, Response } from 'express';
import { topicService } from '../services/topicService';

export class TopicController {
  /**
   * GET /api/topics
   * Query params: search, category, difficulty
   */
  async getTopics(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, difficulty } = req.query;

      const topics = await topicService.getTopics({
        search: typeof search === 'string' ? search : undefined,
        category: typeof category === 'string' ? category : undefined,
        difficulty: typeof difficulty === 'string' ? difficulty : undefined,
      });

      res.status(200).json({
        success: true,
        data: topics,
      });
    } catch (err: any) {
      console.error('[TopicController.getTopics] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve topics',
      });
    }
  }

  /**
   * GET /api/topics/category/:category
   */
  async getTopicsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const topics = await topicService.getTopicsByCategory(category);

      res.status(200).json({
        success: true,
        data: topics,
      });
    } catch (err: any) {
      console.error('[TopicController.getTopicsByCategory] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve topics by category',
      });
    }
  }

  /**
   * GET /api/topics/:slug
   */
  async getTopicBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const topic = await topicService.getTopicBySlug(slug);

      if (!topic) {
        res.status(404).json({
          success: false,
          message: `Topic with slug '${slug}' not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: topic,
      });
    } catch (err: any) {
      console.error('[TopicController.getTopicBySlug] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve topic',
      });
    }
  }
}

export const topicController = new TopicController();
