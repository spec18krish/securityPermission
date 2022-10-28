import { SecurityNode } from './security-node';

 export const permissions = [
   new SecurityNode(1, 'A'),
   new SecurityNode(2, 'A1', 1),
   new SecurityNode(3, 'A2', 1),
   new SecurityNode(4, 'A3', 1),
   new SecurityNode(5, 'A4', 1),

   new SecurityNode(6, 'B'),
   new SecurityNode(7, 'B1', 6),
   new SecurityNode(8, 'B2', 6),
   new SecurityNode(9, 'B3', 6),
   new SecurityNode(10, 'B4', 6),

   new SecurityNode(11, 'C'),
   new SecurityNode(12, 'C1', 11),
   new SecurityNode(13, 'C2', 11),
   new SecurityNode(14, 'C3', 11),
   new SecurityNode(15, 'C4', 11),
   new SecurityNode(16, 'C5', 11),
   new SecurityNode(17, 'C5-1', 16),
   new SecurityNode(18, 'C5-2', 16),
   new SecurityNode(19, 'C5-3', 16),
   new SecurityNode(20, 'C5-4', 16),
   new SecurityNode(21, 'D'),
   new SecurityNode(22, 'E'),
   new SecurityNode(23, 'F'),
   new SecurityNode(24, 'I'),
   new SecurityNode(25, 'J'),
 ];
