const { Router } = require("express");
const userMiddleware = require("../middleware/user");
const { Admin, User, Course } = require("../db");
const { JWT_SECRET } = require("../config");
const router = Router();
const jwt = require("jsonwebtoken");

// User Routes
router.post("/signup", async (req, res) => {
  // Implement user signup logic
  const username = req.body.username;
  const password = req.body.password;

  // check if a user with this username already exists
  await User.create({
    username: username,
    password: password,
  });

  res.json({
    message: "User created successfully",
  });
});

router.post("/signin", async (req, res) => {
  // Implement user signup logic
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.find({
    username,
    password,
  });
  if (user) {
    const token = jwt.sign(
      {
        username,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    res.status(411).json({
      message: "Incorrect email and pass",
    });
  }
});

router.get("/courses", (req, res) => {
  // Implement listing all courses logic
  Course.find({}).then((value) => {
    res.json({ courses: value });
  });
});

router.post("/courses/:courseId", userMiddleware, async (req, res) => {
  // Implement course purchase logic
  const username = req.username;
  const courseId = req.params.courseId;

  try {
    await User.updateOne(
      {
        username: username,
      },
      {
        $push: {
          purchasedCourses: courseId,
        },
      }
    );
    res.json({
      message: "Purchase complete!",
    });
  } catch (err) {
    //console.log(err);
    return res.status(500).send("Server error");
  }
});

router.get("/purchasedCourses", userMiddleware, (req, res) => {
  // Implement fetching purchased courses logic
  User.findOne({
    username: req.username,
  }).then((value) => {
    const purchasedCourseIds = value.purchasedCourses;

    Course.find({ _id: { $in: purchasedCourseIds } })
      .then((match) => {
        // Extract titles of the courses
        console.log(match);
        // take object from the array and store the value of its title property
        const courseTitles = match.map((course) => course.title);

        // Return the titles of the purchased courses
        res.json({ courses: courseTitles });
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch purchased courses" });
      });
  });
});

module.exports = router;
