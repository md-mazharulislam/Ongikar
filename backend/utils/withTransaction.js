const mongoose = require("mongoose");

/**
 * Runs `fn` inside a MongoDB session transaction when the connected server
 * supports it (a replica set — which is what MongoDB Atlas, Atlas Local,
 * and this project's docker-compose.yml all provide). If the server is a
 * plain standalone instance (e.g. a bare local `mongod` during manual dev
 * without replica-set config), transactions aren't supported — in that
 * case we fall back to running `fn` without a session so local development
 * still works, and log a one-time warning.
 *
 * `fn` receives the session (or `null` on fallback) and should pass it to
 * every `.save()` / query that must be part of the atomic operation.
 */
let warnedNoReplicaSet = false;

async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction().catch(() => {});

    const isReplicaSetError =
      /Transaction numbers are only allowed on a replica set|IllegalOperation/i.test(err.message || "");

    if (isReplicaSetError) {
      if (!warnedNoReplicaSet) {
        console.warn(
          "[MongoDB] রেপ্লিকা সেট নেই — ট্রানজ্যাকশন ছাড়াই চালানো হচ্ছে (শুধু ডেভেলপমেন্টের জন্য উপযুক্ত)।"
        );
        warnedNoReplicaSet = true;
      }
      return fn(null);
    }

    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = withTransaction;
