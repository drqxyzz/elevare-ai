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
        const res = await client.query('SELECT usage_count, role FROM users WHERE auth0_id = $1', [auth0Id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function incrementUsage(userId: number) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE users SET usage_count = usage_count + 1 WHERE id = $1', [userId]);
    } finally {
        client.release();
    }
}

export async function saveGeneratedPost(userId: number, inputUrl: string, inputText: string, purpose: string, titles: string[], headlines: string[], suggestions: string) {
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO generated_posts (user_id, input_url, input_text, purpose, titles, headlines, suggestions) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId, inputUrl, inputText, purpose, JSON.stringify(titles), JSON.stringify(headlines), suggestions]
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
