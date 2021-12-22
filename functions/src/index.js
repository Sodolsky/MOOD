const functions = require("firebase-functions");
const firestore = require("@google-cloud/firestore");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const FieldValue = require("firebase-admin").firestore.FieldValue;
const client = new firestore.v1.FirestoreAdminClient();
const bucket = "gs://database-backup-mood-project";

exports.scheduledFirestoreExport = functions.pubsub
  .schedule("every 48 hours")
  .onRun((context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, "(default)");
    return client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: [],
      })
      .then((responses) => {
        const response = responses[0];
        console.log(`Operation Name: ${response["name"]}`);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("Export operation failed");
      });
  });
exports.updateLikeCount = functions
  .region("europe-central2")
  .firestore.document("Posts/{PostID}")
  .onUpdate((change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();
    let oldLikes;
    oldValue.poepleThatLiked.length === undefined
      ? (oldLikes = 0)
      : (oldLikes = oldValue.poepleThatLiked.length);
    let newLikes = newValue.poepleThatLiked.length;
    if (oldLikes === newLikes) {
      return null;
    }
    if (!newLikes) {
      newLikes = 0;
    }
    return change.after.ref.set(
      {
        likeCount: newLikes,
      },
      { merge: true }
    );
  });

exports.checkForNewHashtags = functions
  .region("europe-central2")
  .firestore.document("Posts/{PostID}")
  .onCreate((snap, context) => {
    const hashTagArray = snap.data().hashtags;
    const db = admin.firestore();
    if (hashTagArray.length === 0) {
      return;
    }
    hashTagArray.forEach((item) => {
      const collRef = db.collection("Hashtags");
      collRef
        .where("name", "==", `${item}`)
        .get()
        .then((snap) => {
          if (snap.size === 1) {
            snap.docs[0].ref.update({
              count: FieldValue.increment(1),
            });
          } else {
            const data = { name: item, count: 1 };
            db.collection("Hashtags").doc(item).set(data);
          }
        });
    });
    return;
  });
exports.updatePostCount = functions
  .region("europe-central2")
  .firestore.document("Users/{UserID}")
  .onUpdate((change, context) => {
    const db = admin.firestore();
    const newValue = change.after.data();
    const oldValue = change.before.data();
    const ref = newValue.Login;
    const oldValuePosts = oldValue.UserPosts.length;
    const newValuePosts = newValue.UserPosts.length;
    if (oldValuePosts === newValuePosts) {
      return;
    }
    if (newValuePosts > oldValuePosts) {
      db.doc(`Users/${ref}`).update({
        postCount: FieldValue.increment(1),
      });
    } else {
      db.doc(`Users/${ref}`).update({
        postCount: FieldValue.increment(-1),
      });
    }
    return;
  });
exports.updateCommentCount = functions
  .region("europe-central2")
  .firestore.document("Users/{UserID}")
  .onUpdate((change, context) => {
    const db = admin.firestore();
    const newValue = change.after.data();
    const oldValue = change.before.data();
    const ref = newValue.Login;
    const oldValueComments = oldValue.commentsRef.length;
    const newValueComments = newValue.commentsRef.length;
    if (oldValueComments === newValueComments) {
      return;
    }
    if (newValueComments > oldValueComments) {
      db.doc(`Users/${ref}`).update({
        commentCount: FieldValue.increment(1),
      });
    } else {
      db.doc(`Users/${ref}`).update({
        commentCount: FieldValue.increment(-1),
      });
    }
    return;
  });
exports.addUserLoginToDocument = functions
  .region("europe-central2")
  .firestore.document("Users/{UserID}")
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const newUserLogin = newUser.Login;
    var db = admin.firestore();
    const allUsersDocRef = db.collection("Utility").doc("UserLogins");
    allUsersDocRef
      .get()
      .then((doc) => {
        const arr = doc.data().UserLogins;
        arr.push(newUserLogin);
        doc.ref
          .update({
            UserLogins: arr,
          })
          .catch((err) => {
            console.log(err);
            return;
          });
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  });
