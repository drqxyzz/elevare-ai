import pool from './index';

export async function getOrCreateUser(auth0Id: string, email: string) {
    const client = await pool.connect();
    try {
        const res = await client.query(
            'INSERT INTO users (auth0_id, email) VALUES ($1, $2) ON CONFLICT (auth0_id) DO UPDATE SET email = $2 RETURNING *',
            [auth0Id, email]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getUserUsage(auth0Id: string) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT usage_count, role, is_suspended, daily_usage_count, last_usage_date FROM users WHERE auth0_id = $1', [auth0Id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function incrementUsage(userId: number) {
    const client = await pool.connect();
    try {
        // Check if we need to reset daily count
        const userRes = await client.query('SELECT last_usage_date FROM users WHERE id = $1', [userId]);
        const lastDate = new Date(userRes.rows[0].last_usage_date).toDateString();
        const today = new Date().toDateString();

        if (lastDate !== today) {
            // New day, reset daily count to 1 and update date
            await client.query('UPDATE users SET usage_count = usage_count + 1, daily_usage_count = 1, last_usage_date = CURRENT_DATE WHERE id = $1', [userId]);
        } else {
            // Same day, just increment
            await client.query('UPDATE users SET usage_count = usage_count + 1, daily_usage_count = daily_usage_count + 1 WHERE id = $1', [userId]);
        }
    } finally {
        client.release();
    }
}

export async function saveGeneratedPost(userId: number, inputUrl: string, inputText: string, purpose: string, titles: string[], headlines: string[], suggestions: string, responseJson: any = null) {
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO generated_posts (user_id, input_url, input_text, purpose, titles, headlines, suggestions, response_json) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [userId, inputUrl, inputText, purpose, JSON.stringify(titles), JSON.stringify(headlines), suggestions, responseJson ? JSON.stringify(responseJson) : null]
        );
    } finally {
        client.release();
    }
}

export async function getUserPosts(userId: number) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM generated_posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return res.rows;
    } finally {
        client.release();
    }
}

// --- Admin Actions ---

export async function getAllUsers() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM users ORDER BY created_at DESC');
        return res.rows;
    } finally {
        client.release();
    }
}

export async function updateUserRole(userId: number, role: string) {
    const client = await pool.connect();
    try {
        const res = await client.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, userId]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getAllGenerations(limit = 100) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT gp.*, u.email 
            FROM generated_posts gp 
            JOIN users u ON gp.user_id = u.id 
            ORDER BY gp.created_at DESC 
            LIMIT $1
        `, [limit]);
        return res.rows;
    } finally {
        client.release();
    }
}

export async function getGlobalStats() {
    const client = await pool.connect();
    try {
        const usersCount = await client.query('SELECT COUNT(*) FROM users');
        const generationsCount = await client.query('SELECT COUNT(*) FROM generated_posts');
        const flaggedCount = await client.query('SELECT COUNT(*) FROM generated_posts WHERE is_flagged = TRUE');

        return {
            totalUsers: parseInt(usersCount.rows[0].count, 10),
            totalGenerations: parseInt(generationsCount.rows[0].count, 10),
            flaggedContent: parseInt(flaggedCount.rows[0].count, 10)
        };
    } finally {
        client.release();
    }
}

export async function toggleUserSuspension(userId: number, isSuspended: boolean) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE users SET is_suspended = $1 WHERE id = $2', [isSuspended, userId]);
    } finally {
        client.release();
    }
}

export async function flagContent(postId: number, reason: string) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE generated_posts SET is_flagged = TRUE, flag_reason = $1 WHERE id = $2', [reason, postId]);
    } finally {
        client.release();
    }
}
