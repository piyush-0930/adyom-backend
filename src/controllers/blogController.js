const Blog = require('../models/Blog');

exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search } = req.query;
        const query = {};

        // Public: only published posts
        if (req.user?.role !== 'admin') {
            query.isPublished = true;
        }

        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Blog.countDocuments(query);
        const posts = await Blog.find(query)
            .populate('author', 'name avatar')
            .sort({ featured: -1, publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: posts,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPostBySlug = async (req, res) => {
    try {
        const post = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        post.views += 1;
        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, isPublished, featured } = req.body;

        // Parse tags from comma-separated string or JSON array
        let parsedTags = [];
        if (tags) {
            try { parsedTags = JSON.parse(tags); } catch { parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean); }
        }

        const postData = {
            title,
            content,
            excerpt: excerpt || '',
            category: category || 'art',
            tags: parsedTags,
            author: req.user._id,
            authorName: req.user.name,
            isPublished: isPublished === 'true' || isPublished === true,
            featured: featured === 'true' || featured === true,
        };

        // Attach coverImage URL from multer/Cloudinary
        if (req.file) {
            postData.coverImage = req.file.path;
        }

        const post = await Blog.create(postData);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, isPublished, featured } = req.body;

        let parsedTags = undefined;
        if (tags !== undefined) {
            try { parsedTags = JSON.parse(tags); } catch { parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean); }
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (category !== undefined) updateData.category = category;
        if (parsedTags !== undefined) updateData.tags = parsedTags;
        if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;
        if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;

        if (req.file) {
            updateData.coverImage = req.file.path;
        }

        const post = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Blog.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const likeIndex = post.likes.findIndex(l => l.toString() === req.user._id.toString());
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({
            user: req.user._id,
            name: req.user.name,
            comment: req.body.comment
        });
        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};