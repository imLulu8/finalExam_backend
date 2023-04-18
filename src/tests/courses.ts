import request from "supertest";
require("chai").should();
import { app } from "../app";
import { Course } from "../models/Course";
import bcrypt from "bcrypt";
import { User as UserSchema } from "../models/User";
import { saltRounds } from "../routes/auth";
import jwt from "jsonwebtoken";
const jwtToken = "shhhhhhh";

const basicUrl = "/v1/courses";

describe.only("courses", () => {
  const course = {
    name: "NodeJs",
    category: "serverBackEnd",
    duration: 90,
    price: 1200,
    numMaxSub: 20
  };
  const user = {
    name: "Luca",
    surname: "Commendatore",
    email: "lucac8mmendatore@gmail.com",
    password: "testtest",
  };
  let token: string;
  before(async () => {
    const userCreated = new UserSchema({
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: await bcrypt.hash(user.password, saltRounds),
    });
    await userCreated.save();
    token = jwt.sign(
      {
        id: userCreated._id,
        email: userCreated.email,
        name: userCreated.name,
        surname: userCreated.surname,
      },
      jwtToken
    );
  });
  after(async () => {
    await UserSchema.findOneAndDelete({ email: user.email });
  });
  

  describe("Create course", () => {
    let id: string;
    after(async () => {
      await Course.findByIdAndDelete(id);
    });
    
    it("failed test 401", async () => {
      const { status } = await request(app)
      .post(basicUrl)
      .send(course);
      status.should.be.equal(401);
    });
    it("success test 201", async () => {
      const { status, body } = await request(app)
        .post(basicUrl)
        .send(course)
        .set({ authorization: token });
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("name").equal(course.name);
      body.should.have.property("category").equal(course.category);
      body.should.have.property("duration").equal(course.duration);
      body.should.have.property("price").equal(course.price);
      body.should.have.property("numMaxSub").equal(course.numMaxSub);

      id = body._id;
    });
  });

  describe("Update course", () => {
    let id: string;
    const newCategory = "Front-end";
    before(async () => {
      const p = await Course.create(course);
      id = p._id.toString();
    });
    after(async () => {
      await Course.findByIdAndDelete(id);
    });
    it("test failed 401", async () => {
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send({ ...course, category: newCategory });
      status.should.be.equal(401);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send({ ...course, category: newCategory })
        .set({ authorization: token });
      status.should.be.equal(200);
      body.should.have.property("_id");
      body.should.have.property("name").equal(course.name);
      body.should.have.property("category").equal(newCategory);
      body.should.have.property("duration").equal(course.duration);
      body.should.have.property("price").equal(course.price);
      body.should.have.property("numMaxSub").equal(course.numMaxSub);
    });

    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app)
        .put(`${basicUrl}/${fakeId}`)
        .send({ ...course, category: newCategory })
        .set({ authorization: token });
      status.should.be.equal(404);
    });

    it("test unsuccess 400 missing name", async () => {
      const fakeCourse = { ...course } as any;
      delete fakeCourse.name;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

    it("test unsuccess 400 missing category", async () => {
      const fakeCourse = { ...course } as any;
      delete fakeCourse.category;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

    it("test unsuccess 400 missing duration", async () => {
      const fakeCourse = { ...course } as any;
      delete fakeCourse.duration;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

    it("test unsuccess 400 missing price", async () => {
      const fakeCourse = { ...course } as any;
      delete fakeCourse.price;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });


    it("test unsuccess 400 missing number max subscribe", async () => {
      const fakeCourse = { ...course } as any;
      delete fakeCourse.numMaxSub;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });
 
    it("test unsuccess 400 name not string", async () => {
      const fakeCourse = { ...course } as any;
      fakeCourse.name = 888;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

     
    it("test unsuccess 400 category not string", async () => {
      const fakeCourse = { ...course } as any;
      fakeCourse.name = 777;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });


    it("test unsuccess 400 duration not number", async () => {
      const fakeCourse = { ...course } as any;
      fakeCourse.duration = "NaN";
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

    

    it("test unsuccess 400 price not number", async () => {
      const fakeCourse = { ...course } as any;
      fakeCourse.price = "NaN";
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });
  

    it("test unsuccess 400 numMaxSub not number", async () => {
      const fakeCourse = { ...course } as any;
      fakeCourse.numMaxSub = "NaN";
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCourse)
        .set({ authorization: token });
      status.should.be.equal(400);
    });

  });


  describe("Delete course", () => {
    let id: string;
    before(async () => {
      const p = await Course.create(course);
      id = p._id.toString();
    });
    
    it("test failed 401", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(401);
    });

    it("test success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`)
        .set({ authorization: token });
      status.should.be.equal(200);
    });
  });

  describe("Get course", () => {
    let id: string;
    before(async () => {
      const p = await Course.create(course);
      id = p._id.toString();
    });
    after(async () => {
      await Course.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app).get(`${basicUrl}/${id}`);
      status.should.be.equal(200);
      body.should.have.property("_id").equal(id);
      body.should.have.property("name").equal(course.name);
      body.should.have.property("category").equal(course.category);
      body.should.have.property("duration").equal(course.duration);
      body.should.have.property("price").equal(course.price);
      body.should.have.property("numMaxSub").equal(course.numMaxSub);
    });
 

  describe("Get courses", () => {
    let ids: string[] = [];
    const courses = [
      {
        name: "NodeJs",
        category: "serverBackEnd",
        duration: 90,
        price: 1200,
        numMaxSub: 20
      },
      {
        name: "C",
        category: "Programmazione 1",
        duration: 80,
        price: 150,
        numMaxSub: 19
      },
      {
        name: "Java",
        category: "Programmazione 2",
        duration: 120,
        price: 180,
        numMaxSub: 25
      }
    ];
    before(async () => {
      const response = await Promise.all([
        Course.create(courses[0]),
        Course.create(courses[1]),
        Course.create(courses[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    after(async () => {
      await Promise.all([
        Course.findByIdAndDelete(ids[0]),
        Course.findByIdAndDelete(ids[1]),
        Course.findByIdAndDelete(ids[2]),
      ]);
    });

    it("test success 200", async () => {
      const { status, body } = await request(app).get(basicUrl);
      status.should.be.equal(200);
      body.should.have.property("length").equal(courses.length);
    });
    
    it("test success 200 with query params", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}?category=serverBackEnd`
      );
      status.should.be.equal(200);
      body.should.have.property("length").equal(1);
    });
  });
 });
});
