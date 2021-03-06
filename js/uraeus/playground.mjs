import {scene} from './main.mjs'
import {Sphere_Geometry, Triangular_Prism} from './GeometriesObjects.mjs'
import {Centered, Mirrored} from './vectorOperations.mjs'

function construct()
{    
    var ucaf = new BABYLON.Vector3( 5,0,1);
    var ucar = new BABYLON.Vector3(-5,0,1);
    var ucao = new BABYLON.Vector3( 0,5,1);

    var uca_c1 = new tubeMesh('uca_c1')
    uca_c1.construct([ucaf, ucao, 0.2])

    var uca_c2 = new tubeMesh('uca_c2')
    uca_c2.construct([ucar, ucao, 0.2])

    var uca = new compositeMesh('uca')
    uca.construct([uca_c1, uca_c2])


    var uca_anim = new BABYLON.Animation('uca_anim', "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var keys = [];

    keys.push({
        frame: 0,
        value: new BABYLON.Vector3(10,10,10)
    });

    keys.push({
        frame: 50,
        value: new BABYLON.Vector3(20,20,20)
    });

    keys.push({
        frame: 100,
        value: new BABYLON.Vector3(30,30,30)
    });

    keys.push({
        frame: 150,
        value: new BABYLON.Vector3(40,40,40)
    });

    uca_anim.setKeys(keys);

    uca.mesh.animation = [];
    uca.mesh.animation.push(uca_anim);


    scene.beginDirectAnimation(uca.mesh, [uca_anim], 0, 200, true)
}


function testSphere()
{
    var p1 = new BABYLON.Vector3(5,5,5);
    var sphere = new Sphere_Geometry('test_sphere');
    sphere.construct(p1, 1)
}

//testSphere()

function testExtrude()
{
    var ucaf = new BABYLON.Vector3(-3,2.45,4.40);
    var ucar = new BABYLON.Vector3( 3,2.45,4.40);
    var ucao = new BABYLON.Vector3( 0,2.45,1);

    var geo = new Triangular_Prism('test_sphere');
    geo.construct(ucaf, ucar, ucao, 0.2)

    console.log(Centered(ucaf, ucar))
    console.log(Mirrored(ucaf))
}
//testExtrude()

function loadOnject()
{
    BABYLON.SceneLoader.Append("js/uraeus/", "scene.glb", scene, function (scene) {});

}
//loadOnject()


function loadObj()
{
    var root = new BABYLON.TransformNode();
    
    BABYLON.SceneLoader.ImportMesh("", "./js/uraeus/", "Rims&Tires.obj", scene, function(newMeshes) {
        // You can apply properties to object.
        newMeshes.forEach(mesh => {
            // leave meshes already parented to maintain model hierarchy:
            if (!mesh.parent) {
                mesh.parent = root
            }
        })
});
}

//loadObj()
